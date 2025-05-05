import sqlite3
import json
from pathlib import Path

# Path to the SQLite database and output JSON
DB_PATH = Path("data/sqlite.db")
OUT_PATH = Path("data/hadiths_search_index.json")

# Connect to the SQLite database
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Query to extract searchable fields (add more fields as needed)
cursor.execute(
    """
    SELECT h.source, h.chapter, h.chapter_no, h.hadith_no, h.text_ar, h.text_en, r.name as narrator_name
    FROM hadiths h
    LEFT JOIN hadith_chains c ON h.source = c.source AND h.chapter_no = c.chapter_no AND h.hadith_no = c.hadith_no AND c.position = 1
    LEFT JOIN rawis r ON c.scholar_indx = r.scholar_indx
"""
)

rows = cursor.fetchall()

# Column names for dict conversion
columns = [desc[0] for desc in cursor.description]

# Convert to list of dicts
hadiths = [dict(zip(columns, row)) for row in rows]

# Write to JSON file
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(hadiths, f, ensure_ascii=False, indent=2)

print(f"Exported {len(hadiths)} hadiths to {OUT_PATH}")
