import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "presets.db")

CATEGORIES = ("vocal_style", "instrument", "mood", "influence")

SCHEMA = """
CREATE TABLE IF NOT EXISTS presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('vocal_style', 'instrument', 'mood', 'influence')),
    label TEXT NOT NULL,
    text TEXT NOT NULL,
    UNIQUE(category, label)
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

SEED_VOCAL_STYLE_LABEL = "Robotic soprano (original)"
SEED_VOCAL_STYLE_TEXT = (
    "A haunting female soprano with a robotic, glitchy vibrato, "
    "reminiscent of a broken music box."
)


def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    _seed(conn)
    return conn


def _seed(conn):
    row = conn.execute(
        "SELECT id FROM presets WHERE category = 'vocal_style' AND label = ?",
        (SEED_VOCAL_STYLE_LABEL,),
    ).fetchone()
    if row is None:
        cur = conn.execute(
            "INSERT INTO presets (category, label, text) VALUES ('vocal_style', ?, ?)",
            (SEED_VOCAL_STYLE_LABEL, SEED_VOCAL_STYLE_TEXT),
        )
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('active_vocal_style_id', ?)",
            (str(cur.lastrowid),),
        )
        conn.commit()


def get_setting(conn, key, default=None):
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row is not None else default


def set_setting(conn, key, value):
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )
    conn.commit()


def list_presets(conn, category):
    return conn.execute(
        "SELECT id, label, text FROM presets WHERE category = ? ORDER BY label COLLATE NOCASE",
        (category,),
    ).fetchall()


def get_preset(conn, preset_id):
    return conn.execute("SELECT id, category, label, text FROM presets WHERE id = ?", (preset_id,)).fetchone()


def save_preset(conn, category, label, text):
    """Create a new preset, or update the existing one with the same (category, label)."""
    existing = conn.execute(
        "SELECT id FROM presets WHERE category = ? AND label = ?", (category, label)
    ).fetchone()
    if existing:
        conn.execute("UPDATE presets SET text = ? WHERE id = ?", (text, existing["id"]))
        preset_id = existing["id"]
    else:
        cur = conn.execute(
            "INSERT INTO presets (category, label, text) VALUES (?, ?, ?)",
            (category, label, text),
        )
        preset_id = cur.lastrowid
    conn.commit()
    return preset_id


def add_preset_if_missing(conn, category, label, text):
    """Insert (category, label) if it doesn't already exist; no-op otherwise."""
    conn.execute(
        "INSERT OR IGNORE INTO presets (category, label, text) VALUES (?, ?, ?)",
        (category, label, text),
    )
    conn.commit()


def delete_preset(conn, preset_id):
    conn.execute("DELETE FROM presets WHERE id = ?", (preset_id,))
    conn.commit()
