"""
CapacityIQ - Flask Backend
Run with: python app.py
"""

from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import os
import json
from datetime import datetime, date
from functools import wraps

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    template_folder=os.path.join(BASE_DIR, "templates"))
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))
CORS(app, supports_credentials=True)

DB_PATH = os.environ.get("DB_PATH", "capacityiq.db")

# ─────────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS staff (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                hours_per_week INTEGER DEFAULT 40,
                color TEXT DEFAULT '#3b82f6',
                active INTEGER DEFAULT 1,
                removed_at TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                status TEXT DEFAULT 'Active',
                priority TEXT DEFAULT 'Medium',
                budget REAL,
                hourly_rate REAL DEFAULT 190,
                color TEXT DEFAULT '#3b82f6',
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL,
                person_name TEXT NOT NULL,
                week_key TEXT NOT NULL,
                pct INTEGER DEFAULT 0,
                UNIQUE(project_id, person_name, week_key)
            );

            CREATE TABLE IF NOT EXISTS vacations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_name TEXT NOT NULL,
                start_wk TEXT NOT NULL,
                end_wk TEXT NOT NULL,
                label TEXT DEFAULT 'Vacation',
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS placeholder_slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL UNIQUE,
                slot_count INTEGER DEFAULT 0
            );
        """)
        # Seed default admin if no users exist
        cur = conn.execute("SELECT COUNT(*) as c FROM users")
        if cur.fetchone()["c"] == 0:
            seed_admin(conn)

def seed_admin(conn):
    """Create a default admin account on first run."""
    pw = hash_password("admin123")
    conn.execute(
        "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)",
        ("admin", pw)
    )
    conn.commit()
    print("=" * 50)
    print("  Default admin account created:")
    print("  Username: admin")
    print("  Password: admin123")
    print("  CHANGE THIS PASSWORD after first login!")
    print("=" * 50)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ─────────────────────────────────────────────
# AUTH DECORATORS
# ─────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Not authenticated"}), 401
        if not session.get("is_admin"):
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

# ─────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE username = ? AND password_hash = ?",
            (username, hash_password(password))
        ).fetchone()
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["is_admin"] = bool(user["is_admin"])
    return jsonify({
        "username": user["username"],
        "is_admin": bool(user["is_admin"])
    })

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})

@app.route("/api/auth/me")
def me():
    if "user_id" not in session:
        return jsonify({"authenticated": False}), 401
    return jsonify({
        "authenticated": True,
        "username": session["username"],
        "is_admin": session.get("is_admin", False)
    })

@app.route("/api/auth/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.json
    current = data.get("current_password", "")
    new_pw = data.get("new_password", "")
    if len(new_pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE id = ? AND password_hash = ?",
            (session["user_id"], hash_password(current))
        ).fetchone()
        if not user:
            return jsonify({"error": "Current password is incorrect"}), 401
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (hash_password(new_pw), session["user_id"])
        )
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# USER MANAGEMENT (admin only)
# ─────────────────────────────────────────────

@app.route("/api/users", methods=["GET"])
@admin_required
def get_users():
    with get_db() as conn:
        users = conn.execute(
            "SELECT id, username, is_admin, created_at FROM users ORDER BY username"
        ).fetchall()
    return jsonify([dict(u) for u in users])

@app.route("/api/users", methods=["POST"])
@admin_required
def create_user():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    is_admin = data.get("is_admin", False)
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)",
                (username, hash_password(password), 1 if is_admin else 0)
            )
            conn.commit()
        return jsonify({"ok": True})
    except sqlite3.IntegrityError:
        return jsonify({"error": f"Username '{username}' already exists"}), 409

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    if user_id == session["user_id"]:
        return jsonify({"error": "Cannot delete your own account"}), 400
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    return jsonify({"ok": True})

@app.route("/api/users/<int:user_id>/reset-password", methods=["POST"])
@admin_required
def reset_password(user_id):
    data = request.json
    new_pw = data.get("new_password", "")
    if len(new_pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (hash_password(new_pw), user_id)
        )
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# STAFF ROUTES
# ─────────────────────────────────────────────

@app.route("/api/staff", methods=["GET"])
@login_required
def get_staff():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM staff ORDER BY name"
        ).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/staff", methods=["POST"])
@login_required
def add_staff():
    data = request.json
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO staff (name, hours_per_week, color) VALUES (?, ?, ?)",
                (data["name"], data.get("hoursPerWeek", 40), data.get("color", "#3b82f6"))
            )
            conn.commit()
        return jsonify({"ok": True})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Staff member with this name already exists"}), 409

@app.route("/api/staff/<path:name>", methods=["PATCH"])
@login_required
def update_staff(name):
    data = request.json
    fields = []
    values = []
    if "hoursPerWeek" in data:
        fields.append("hours_per_week = ?")
        values.append(data["hoursPerWeek"])
    if "color" in data:
        fields.append("color = ?")
        values.append(data["color"])
    if not fields:
        return jsonify({"error": "Nothing to update"}), 400
    values.append(name)
    with get_db() as conn:
        conn.execute(f"UPDATE staff SET {', '.join(fields)} WHERE name = ?", values)
        conn.commit()
    return jsonify({"ok": True})

@app.route("/api/staff/<path:name>", methods=["DELETE"])
@login_required
def remove_staff(name):
    """
    Soft-remove: mark as inactive, clear future allocations only.
    Past allocations (weeks before today) are preserved for project health.
    """
    today_wk = get_iso_week(date.today())
    with get_db() as conn:
        conn.execute(
            "UPDATE staff SET active = 0, removed_at = ? WHERE name = ?",
            (datetime.now().isoformat(), name)
        )
        # Delete only current + future allocations
        conn.execute(
            "DELETE FROM allocations WHERE person_name = ? AND week_key >= ?",
            (name, today_wk)
        )
        # Remove future vacations
        conn.execute(
            "DELETE FROM vacations WHERE person_name = ? AND end_wk >= ?",
            (name, today_wk)
        )
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# PROJECT ROUTES
# ─────────────────────────────────────────────

@app.route("/api/projects", methods=["GET"])
@login_required
def get_projects():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM projects ORDER BY project_id").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/projects", methods=["POST"])
@login_required
def add_project():
    data = request.json
    try:
        with get_db() as conn:
            conn.execute(
                """INSERT INTO projects (project_id, name, status, priority, budget, hourly_rate, color)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (data["id"], data["name"], data.get("status","Active"),
                 data.get("priority","Medium"), data.get("budget"),
                 data.get("hourlyRate", 190), data.get("color","#3b82f6"))
            )
            conn.commit()
        return jsonify({"ok": True})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Project ID already exists"}), 409

@app.route("/api/projects/<path:project_id>", methods=["PATCH"])
@login_required
def update_project(project_id):
    data = request.json
    fields = []
    values = []
    mapping = {
        "name": "name", "status": "status", "priority": "priority",
        "budget": "budget", "hourlyRate": "hourly_rate", "color": "color"
    }
    for key, col in mapping.items():
        if key in data:
            fields.append(f"{col} = ?")
            values.append(data[key])
    if not fields:
        return jsonify({"error": "Nothing to update"}), 400
    values.append(project_id)
    with get_db() as conn:
        conn.execute(f"UPDATE projects SET {', '.join(fields)} WHERE project_id = ?", values)
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# ALLOCATION ROUTES
# ─────────────────────────────────────────────

@app.route("/api/allocations", methods=["GET"])
@login_required
def get_allocations():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM allocations WHERE pct > 0").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/allocations", methods=["POST"])
@login_required
def set_allocation():
    """Set a single allocation cell. pct=0 deletes it."""
    data = request.json
    pid = data["project_id"]
    person = data["person_name"]
    wk = data["week_key"]
    pct = int(data.get("pct", 0))
    with get_db() as conn:
        if pct == 0:
            conn.execute(
                "DELETE FROM allocations WHERE project_id=? AND person_name=? AND week_key=?",
                (pid, person, wk)
            )
        else:
            conn.execute(
                """INSERT INTO allocations (project_id, person_name, week_key, pct)
                   VALUES (?, ?, ?, ?)
                   ON CONFLICT(project_id, person_name, week_key) DO UPDATE SET pct=excluded.pct""",
                (pid, person, wk, pct)
            )
        conn.commit()
    return jsonify({"ok": True})

@app.route("/api/allocations/bulk", methods=["POST"])
@login_required
def bulk_set_allocations():
    """Bulk upsert — accepts list of {project_id, person_name, week_key, pct}."""
    items = request.json
    with get_db() as conn:
        for item in items:
            pid = item["project_id"]
            person = item["person_name"]
            wk = item["week_key"]
            pct = int(item.get("pct", 0))
            if pct == 0:
                conn.execute(
                    "DELETE FROM allocations WHERE project_id=? AND person_name=? AND week_key=?",
                    (pid, person, wk)
                )
            else:
                conn.execute(
                    """INSERT INTO allocations (project_id, person_name, week_key, pct)
                       VALUES (?, ?, ?, ?)
                       ON CONFLICT(project_id, person_name, week_key) DO UPDATE SET pct=excluded.pct""",
                    (pid, person, wk, pct)
                )
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# VACATION ROUTES
# ─────────────────────────────────────────────

@app.route("/api/vacations", methods=["GET"])
@login_required
def get_vacations():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM vacations ORDER BY start_wk").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/vacations", methods=["POST"])
@login_required
def add_vacation():
    data = request.json
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO vacations (person_name, start_wk, end_wk, label) VALUES (?, ?, ?, ?)",
            (data["name"], data["startWk"], data["endWk"], data.get("label","Vacation"))
        )
        conn.commit()
        vac_id = cur.lastrowid
    return jsonify({"ok": True, "id": vac_id})

@app.route("/api/vacations/<int:vac_id>", methods=["DELETE"])
@login_required
def delete_vacation(vac_id):
    with get_db() as conn:
        conn.execute("DELETE FROM vacations WHERE id = ?", (vac_id,))
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# PLACEHOLDER SLOTS ROUTES
# ─────────────────────────────────────────────

@app.route("/api/placeholder-slots", methods=["GET"])
@login_required
def get_placeholder_slots():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM placeholder_slots").fetchall()
    return jsonify({r["project_id"]: r["slot_count"] for r in rows})

@app.route("/api/placeholder-slots/<path:project_id>", methods=["POST"])
@login_required
def set_placeholder_slots(project_id):
    count = request.json.get("count", 0)
    with get_db() as conn:
        if count <= 0:
            conn.execute("DELETE FROM placeholder_slots WHERE project_id = ?", (project_id,))
        else:
            conn.execute(
                """INSERT INTO placeholder_slots (project_id, slot_count) VALUES (?, ?)
                   ON CONFLICT(project_id) DO UPDATE SET slot_count=excluded.slot_count""",
                (project_id, count)
            )
        conn.commit()
    return jsonify({"ok": True})

# ─────────────────────────────────────────────
# FULL STATE — single endpoint to load everything at once
# ─────────────────────────────────────────────

@app.route("/api/state", methods=["GET"])
@login_required
def get_full_state():
    """Returns all data in one request so the frontend loads fast."""
    with get_db() as conn:
        staff = [dict(r) for r in conn.execute("SELECT * FROM staff ORDER BY name").fetchall()]
        projects = [dict(r) for r in conn.execute("SELECT * FROM projects ORDER BY project_id").fetchall()]
        allocations = [dict(r) for r in conn.execute("SELECT * FROM allocations WHERE pct > 0").fetchall()]
        vacations = [dict(r) for r in conn.execute("SELECT * FROM vacations ORDER BY start_wk").fetchall()]
        ph_rows = conn.execute("SELECT * FROM placeholder_slots").fetchall()
        placeholder_slots = {r["project_id"]: r["slot_count"] for r in ph_rows}

    # Reshape for the frontend
    alloc_map = {}
    for a in allocations:
        key = f"{a['project_id']}||{a['person_name']}||{a['week_key']}"
        alloc_map[key] = a["pct"]

    return jsonify({
        "staff": [{
            "name": s["name"],
            "hoursPerWeek": s["hours_per_week"],
            "color": s["color"],
            "active": bool(s["active"]),
            "removedAt": s["removed_at"]
        } for s in staff],
        "projects": [{
            "id": p["project_id"],
            "name": p["name"],
            "status": p["status"],
            "priority": p["priority"],
            "budget": p["budget"],
            "hourlyRate": p["hourly_rate"],
            "color": p["color"]
        } for p in projects],
        "allocMap": alloc_map,
        "vacations": [{
            "id": v["id"],
            "name": v["person_name"],
            "startWk": v["start_wk"],
            "endWk": v["end_wk"],
            "label": v["label"]
        } for v in vacations],
        "placeholderSlots": placeholder_slots
    })

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def seed_initial_data():
    """Seed staff, projects, and allocations if the database is empty."""
    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) as c FROM staff").fetchone()["c"]
        if count > 0:
            return  # already seeded, skip

        print("Seeding initial data...")

        STAFF = [
            ("Anne Hasuly",      40, "#3b82f6"),
            ("Annie Fisher",     40, "#8b5cf6"),
            ("Barry Geraci",     40, "#10b981"),
            ("Bill Hentschel",   40, "#f59e0b"),
            ("Corrin Nolin",     40, "#ef4444"),
            ("David Buckley",    40, "#06b6d4"),
            ("Ed Shearer",       40, "#84cc16"),
            ("Ethan Johnson",    40, "#f97316"),
            ("Harrison Brann",   40, "#ec4899"),
            ("Jackie Campbell",  40, "#a855f7"),
            ("Jacob Frost",      40, "#14b8a6"),
            ("Joshua Sebastian", 40, "#f43f5e"),
            ("Kaitlyn Dunn",     20, "#6366f1"),
            ("Luke Strawson",    40, "#22c55e"),
            ("Michael Booth",    40, "#fb923c"),
            ("Mitchell Levi",    40, "#0ea5e9"),
            ("Ryan Rendall",     40, "#d946ef"),
            ("Tyler Zylinski",   40, "#facc15"),
        ]

        PROJECTS = [
            ("0013-054",   "LBT - 6psi 30k Tank Barge Design",        "Active",    "High",   9000,  190, "#3b82f6"),
            ("0106-037",   "Blessey - WEB 180 Modifications",          "Active",    "Medium", None,  190, "#8b5cf6"),
            ("0130-TSGI",  "TSGI - Misc Projects",                     "Active",    "Low",    None,  190, "#10b981"),
            ("0227-004",   "Buffalo Marine - B304 Modifications",      "Active",    "Medium", None,  190, "#f59e0b"),
            ("0227-005",   "Buffalo Marine - B305 Modifications",      "Active",    "Medium", None,  190, "#ef4444"),
            ("0227-006",   "Buffalo Marine - B407 Bunker Boom",        "Active",    "Low",    None,  190, "#06b6d4"),
            ("0248-023",   "Kinder Morgan - Dock Barge Design",        "Active",    "High",   22500, 190, "#84cc16"),
            ("0274-25427", "BHGI - Transverse Strength Analysis",      "Active",    "High",   15000, 190, "#f97316"),
            ("0274-26430", "BHGI - EIV Capital",                       "Active",    "Medium", None,  190, "#ec4899"),
            ("0274-26XXX", "BHGI - GDEB Sea Shuttle",                  "Active",    "Medium", None,  190, "#a855f7"),
            ("0274-XX2",   "BHGI - ULA Construction Oversight",        "Active",    "Low",    None,  190, "#14b8a6"),
            ("0363-006",   "DonJon - Crane Barge Design",              "Active",    "High",   None,  190, "#f43f5e"),
            ("0372-004",   "TXDOT - Maintenance Oversight",            "Active",    "Medium", None,  190, "#6366f1"),
            ("0372-005",   "TXDOT - Specification Update",             "Active",    "Low",    None,  190, "#22c55e"),
            ("0382-XXX",   "JFB - Spud Modifications",                 "Active",    "Low",    None,  190, "#fb923c"),
            ("0420-XX1",   "Mike Hooks - STROUD Repower",              "Tentative", "Medium", None,  190, "#94a3b8"),
            ("0420-XX2",   "Mike Hooks - 27\" CSD Design",             "Tentative", "Medium", None,  190, "#64748b"),
            ("0430-004",   "MDC - Soo Locks Crane Barge",              "Active",    "High",   None,  190, "#0ea5e9"),
            ("0430-007",   "MDC - MSU Mooring Barge",                  "Active",    "High",   None,  190, "#d946ef"),
            ("0430-008",   "MDC - Leonard Widening",                   "Active",    "Medium", None,  190, "#facc15"),
            ("0430-009",   "MDC - CELRE Stop Log Barge",               "Active",    "Medium", None,  190, "#4ade80"),
            ("0430-012",   "MDC - BROWNLEE Modifications",             "Active",    "High",   None,  190, "#fb7185"),
            ("0430-014",   "MDC - Soo Locks AE Support",               "Tentative", "Low",    None,  190, "#a3e635"),
            ("0430-XX1",   "MDC - Spud Barge Design",                  "Tentative", "Medium", None,  190, "#38bdf8"),
            ("0430-XX2",   "MDC - BGU Mooring Barge Design",           "Tentative", "Low",    None,  190, "#c084fc"),
            ("0439-001",   "Curtin - DB Catalina",                     "Active",    "Medium", None,  190, "#34d399"),
            ("0461-001",   "Shoreline - 180' Crane Barge Design",      "Active",    "High",   None,  190, "#fbbf24"),
        ]

        ALLOCATIONS = [
            ("0013-054",   "Luke Strawson",    "2026-05", 100),
            ("0013-054",   "Luke Strawson",    "2026-06", 100),
            ("0106-037",   "Bill Hentschel",   "2026-08",  50),
            ("0106-037",   "Bill Hentschel",   "2026-09",  50),
            ("0130-TSGI",  "David Buckley",    "2026-07", 100),
            ("0130-TSGI",  "David Buckley",    "2026-08", 100),
            ("0130-TSGI",  "David Buckley",    "2026-09", 100),
            ("0130-TSGI",  "Ed Shearer",       "2026-03",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-04",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-05",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-06",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-07",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-08",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-09",  25),
            ("0130-TSGI",  "Ed Shearer",       "2026-10",  25),
            ("0130-TSGI",  "Joshua Sebastian", "2026-07",  50),
            ("0130-TSGI",  "Joshua Sebastian", "2026-08",  50),
            ("0130-TSGI",  "Joshua Sebastian", "2026-09",  50),
            ("0130-TSGI",  "Joshua Sebastian", "2026-10",  50),
            ("0248-023",   "Luke Strawson",    "2026-10", 100),
            ("0248-023",   "Luke Strawson",    "2026-11", 100),
            ("0248-023",   "Luke Strawson",    "2026-12", 100),
            ("0248-023",   "Luke Strawson",    "2026-13", 100),
            ("0248-023",   "Luke Strawson",    "2026-14", 100),
            ("0248-023",   "Luke Strawson",    "2026-15", 100),
            ("0274-26430", "Anne Hasuly",      "2026-08", 100),
            ("0274-26430", "Anne Hasuly",      "2026-09", 100),
            ("0274-26430", "Anne Hasuly",      "2026-10", 100),
            ("0274-26430", "Anne Hasuly",      "2026-11",  50),
            ("0274-26430", "Michael Booth",    "2026-08", 100),
            ("0274-26430", "Michael Booth",    "2026-09", 100),
            ("0274-26430", "Michael Booth",    "2026-10", 100),
            ("0274-26430", "Michael Booth",    "2026-11", 100),
            ("0363-006",   "Luke Strawson",    "2026-07", 100),
            ("0363-006",   "Luke Strawson",    "2026-08", 100),
            ("0363-006",   "Luke Strawson",    "2026-09", 100),
            ("0363-006",   "Jackie Campbell",  "2026-08",  50),
            ("0363-006",   "Jackie Campbell",  "2026-09",  50),
            ("0363-006",   "Jackie Campbell",  "2026-10", 100),
            ("0363-006",   "Jackie Campbell",  "2026-11", 100),
            ("0372-004",   "Ryan Rendall",     "2026-07", 100),
            ("0372-004",   "Ryan Rendall",     "2026-08", 100),
            ("0372-004",   "Ryan Rendall",     "2026-09", 100),
            ("0372-004",   "Ryan Rendall",     "2026-10", 100),
            ("0372-004",   "Ryan Rendall",     "2026-11", 100),
            ("0372-004",   "Ryan Rendall",     "2026-12", 100),
            ("0372-004",   "Ryan Rendall",     "2026-13", 100),
            ("0372-004",   "Ryan Rendall",     "2026-14", 100),
            ("0372-004",   "Bill Hentschel",   "2026-07",  25),
            ("0372-004",   "Bill Hentschel",   "2026-08",  25),
            ("0372-004",   "Bill Hentschel",   "2026-09",  25),
            ("0372-004",   "Bill Hentschel",   "2026-10",  25),
            ("0372-004",   "Bill Hentschel",   "2026-11",  25),
            ("0372-004",   "Bill Hentschel",   "2026-12",  25),
            ("0430-007",   "Corrin Nolin",     "2026-07", 100),
            ("0430-007",   "Corrin Nolin",     "2026-08", 100),
            ("0430-007",   "Corrin Nolin",     "2026-09", 100),
            ("0430-007",   "Corrin Nolin",     "2026-10", 100),
            ("0430-007",   "Corrin Nolin",     "2026-11", 100),
            ("0430-007",   "Corrin Nolin",     "2026-12", 100),
            ("0430-007",   "Corrin Nolin",     "2026-13", 100),
            ("0430-007",   "Corrin Nolin",     "2026-14", 100),
            ("0430-007",   "Corrin Nolin",     "2026-15", 100),
            ("0430-007",   "Corrin Nolin",     "2026-16", 100),
            ("0430-007",   "Ethan Johnson",    "2026-08", 100),
            ("0430-007",   "Ethan Johnson",    "2026-09",  50),
            ("0430-007",   "Ethan Johnson",    "2026-10", 100),
            ("0430-007",   "Ethan Johnson",    "2026-11", 100),
            ("0430-007",   "Ethan Johnson",    "2026-12", 100),
            ("0430-007",   "Ethan Johnson",    "2026-13", 100),
            ("0430-007",   "Ethan Johnson",    "2026-14", 100),
            ("0430-007",   "Ethan Johnson",    "2026-15", 100),
            ("0430-007",   "Ethan Johnson",    "2026-16", 100),
            ("0430-007",   "Tyler Zylinski",   "2026-07", 100),
            ("0430-007",   "Tyler Zylinski",   "2026-08", 100),
            ("0430-012",   "Annie Fisher",     "2026-03", 100),
            ("0430-012",   "Annie Fisher",     "2026-04", 100),
            ("0430-012",   "Annie Fisher",     "2026-05", 100),
            ("0430-012",   "Annie Fisher",     "2026-06", 100),
            ("0430-012",   "Annie Fisher",     "2026-07", 100),
            ("0430-012",   "Annie Fisher",     "2026-08", 100),
            ("0430-012",   "Mitchell Levi",    "2026-03", 100),
            ("0430-012",   "Mitchell Levi",    "2026-04", 100),
            ("0430-012",   "Mitchell Levi",    "2026-05", 100),
            ("0430-012",   "Mitchell Levi",    "2026-06", 100),
            ("0430-012",   "Mitchell Levi",    "2026-07", 100),
            ("0430-012",   "Mitchell Levi",    "2026-08", 100),
        ]

        for name, hours, color in STAFF:
            conn.execute("INSERT OR IGNORE INTO staff (name, hours_per_week, color) VALUES (?,?,?)",
                        (name, hours, color))

        for row in PROJECTS:
            conn.execute("""INSERT OR IGNORE INTO projects
                           (project_id, name, status, priority, budget, hourly_rate, color)
                           VALUES (?,?,?,?,?,?,?)""", row)

        for pid, person, wk, pct in ALLOCATIONS:
            conn.execute("""INSERT OR IGNORE INTO allocations
                           (project_id, person_name, week_key, pct) VALUES (?,?,?,?)""",
                        (pid, person, wk, pct))

        conn.commit()
        print("✓ Initial data seeded successfully.")


    iso = d.isocalendar()
    return f"{iso[0]}-{str(iso[1]).zfill(2)}"

# ─────────────────────────────────────────────
# SERVE FRONTEND
# ─────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    static_dir = os.path.join(BASE_DIR, "static")
    if path and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, "index.html")

# ─────────────────────────────────────────────
# STARTUP — init_db called at module level so
# gunicorn triggers it (not just python app.py)
# ─────────────────────────────────────────────

init_db()  # runs on every worker startup
seed_initial_data()  # runs once if database is empty

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    print(f"CapacityIQ running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
