import sqlite3
import json
from pathlib import Path

DB_PATH = Path("data/sqlite.db")
OUT_PATH = Path("public/hadiths.json")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Only include Sahih Bukhari (and optionally Sahih Muslim), and only hadiths with explanations
sources = ["Sahih Bukhari", "Sahih Muslim"]  # Add "Sahih Muslim" if needed
all_hadiths = []
for source in sources:
    cursor.execute(
        """
        SELECT h.source, h.chapter, h.chapter_no, h.hadith_no, h.text_ar, r.name as narrator_name
        FROM hadiths h
        LEFT JOIN hadith_chains c ON h.source = c.source AND h.chapter_no = c.chapter_no AND h.hadith_no = c.hadith_no AND c.position = 1
        LEFT JOIN rawis r ON c.scholar_indx = r.scholar_indx
        WHERE h.source = ? AND h.explanation IS NOT NULL AND h.explanation != ''
        """,
        (source,),
    )
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    hadiths = [dict(zip(columns, row)) for row in rows]
    all_hadiths.extend(hadiths)

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(all_hadiths, f, ensure_ascii=False, indent=2)
print(f"Exported {len(all_hadiths)} hadiths to {OUT_PATH}")
