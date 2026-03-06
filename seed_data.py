"""
seed_data.py — Run this ONCE after first deployment to load initial staff,
projects, and allocations into the database.

Usage:
    python seed_data.py
"""

import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", "capacityiq.db")

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
    ("0013-054",   "LBT - 6psi 30k Tank Barge Design",          "Active",    "High",   9000,  190, "#3b82f6"),
    ("0106-037",   "Blessey - WEB 180 Modifications",            "Active",    "Medium", None,  190, "#8b5cf6"),
    ("0130-TSGI",  "TSGI - Misc Projects",                       "Active",    "Low",    None,  190, "#10b981"),
    ("0227-004",   "Buffalo Marine - B304 Modifications",        "Active",    "Medium", None,  190, "#f59e0b"),
    ("0227-005",   "Buffalo Marine - B305 Modifications",        "Active",    "Medium", None,  190, "#ef4444"),
    ("0248-023",   "Dann Ocean Towing - Salvage Tug Conversion", "Active",    "High",   95000, 190, "#06b6d4"),
    ("0274-26430", "Chet Morrison - Liftboat Stiffening",        "Active",    "High",   28500, 190, "#84cc16"),
    ("0363-006",   "Crimson - CB-3 Ballast System",              "Active",    "Medium", 14250, 190, "#f97316"),
    ("0372-004",   "Laborde - CAPT PHANOR Conversion",           "Active",    "High",   76000, 190, "#ec4899"),
    ("0430-007",   "Stolt Tankers - Product Tanker Design",      "Active",    "High",   190000,190, "#a855f7"),
    ("0430-012",   "Stolt - Stainless Steel Tank Design",        "Active",    "Medium", 57000, 190, "#14b8a6"),
    ("0430-015",   "Stolt - Cargo Systems Review",               "Tentative", "Medium", 19000, 190, "#f43f5e"),
    ("0501-003",   "Harvey Gulf - OSV Modifications",            "Active",    "Low",    None,  190, "#6366f1"),
    ("0512-001",   "Rigdon Marine - Crew Boat Design",           "Tentative", "High",   42750, 190, "#22c55e"),
    ("0523-008",   "Canal Barge - Hopper Design",                "Active",    "Medium", None,  190, "#fb923c"),
    ("0534-002",   "Marquette - Towboat Modifications",          "Active",    "Low",    None,  190, "#0ea5e9"),
    ("0545-001",   "Manson - Derrick Barge Study",               "Tentative", "High",   85500, 190, "#d946ef"),
    ("0556-004",   "Genesis Energy - Tank Barge Repair",         "Active",    "Medium", 11400, 190, "#facc15"),
    ("0567-001",   "Bisso - Tug Stability Analysis",             "Active",    "Low",    None,  190, "#4ade80"),
    ("0578-003",   "Otto Candies - Crew Transfer Vessel",        "Tentative", "Medium", 28500, 190, "#fb7185"),
    ("0589-002",   "Offshore Inland - Barge Conversion",         "Active",    "Medium", None,  190, "#a3e635"),
    ("0590-005",   "Enterprise Marine - Platform Supply",        "Active",    "High",   114000,190, "#38bdf8"),
    ("0601-001",   "Caillou Island - Towing Vessel Design",      "Tentative", "Low",    None,  190, "#c084fc"),
    ("0612-002",   "Turner Marine - Pushboat Retrofit",          "Active",    "Medium", None,  190, "#34d399"),
    ("0623-003",   "Associated Terminals - Fleeting Study",      "Complete",  "Low",    9500,  190, "#94a3b8"),
    ("0634-001",   "Crosby Tugs - Z-Drive Conversion",           "Complete",  "Medium", 23750, 190, "#94a3b8"),
    ("0645-002",   "Hollywood Marine - Dry Dock Survey",         "Complete",  "Low",    None,  190, "#94a3b8"),
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

def run():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # check db is initialized
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    table_names = [t["name"] for t in tables]
    if "staff" not in table_names:
        print("ERROR: Database not initialized. Run `python app.py` first to create the database, then run this script.")
        return

    print("Seeding staff...")
    for name, hours, color in STAFF:
        try:
            conn.execute("INSERT INTO staff (name, hours_per_week, color) VALUES (?, ?, ?)",
                        (name, hours, color))
        except sqlite3.IntegrityError:
            print(f"  Skipping {name} (already exists)")
    conn.commit()

    print("Seeding projects...")
    for row in PROJECTS:
        try:
            conn.execute("""INSERT INTO projects (project_id, name, status, priority, budget, hourly_rate, color)
                           VALUES (?, ?, ?, ?, ?, ?, ?)""", row)
        except sqlite3.IntegrityError:
            print(f"  Skipping {row[0]} (already exists)")
    conn.commit()

    print("Seeding allocations...")
    for pid, person, wk, pct in ALLOCATIONS:
        conn.execute("""INSERT INTO allocations (project_id, person_name, week_key, pct)
                       VALUES (?, ?, ?, ?)
                       ON CONFLICT(project_id, person_name, week_key) DO UPDATE SET pct=excluded.pct""",
                    (pid, person, wk, pct))
    conn.commit()
    conn.close()

    print("\n✓ Done! Your initial data has been loaded.")
    print("  Staff:       ", len(STAFF))
    print("  Projects:    ", len(PROJECTS))
    print("  Allocations: ", len(ALLOCATIONS))

if __name__ == "__main__":
    run()
