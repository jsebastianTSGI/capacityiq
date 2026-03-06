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

app = Flask(__name__, static_folder="static", template_folder="templates")
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

def get_iso_week(d: date) -> str:
    iso = d.isocalendar()
    return f"{iso[0]}-{str(iso[1]).zfill(2)}"

# ─────────────────────────────────────────────
# SERVE FRONTEND
# ─────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# ─────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    print(f"CapacityIQ running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
