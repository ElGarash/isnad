import sqlite3
import json
import re
from pathlib import Path

DB_PATH = Path("data/sqlite.db")
OUT_PATH = Path("public/search_index.json")


def normalize_whitespace(text):
    if not text:
        return text
    return re.sub(r"\s+", " ", text).strip()


def strip_diacritics(text):
    # Remove Arabic diacritics (tashkeel) and bidirectional marks (RLM, LRM, etc.)
    if not text:
        return text
    # Arabic diacritics unicode range + bidirectional marks (RLM, LRM, etc.)
    return re.sub(
        r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u200E\u200F\u202A-\u202E\u2066-\u2069]",
        "",
        text,
    )


def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Fetch all hadiths from all sources
    cursor.execute(
        """
        SELECT h.id, h.source, h.chapter, h.chapter_no, h.hadith_no, h.text_ar, r.name as narrator_name
        FROM hadiths h
        LEFT JOIN hadith_chains c ON h.source = c.source AND h.chapter_no = c.chapter_no AND h.hadith_no = c.hadith_no AND c.position = 1
        LEFT JOIN rawis r ON c.scholar_indx = r.scholar_indx
        """
    )
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    all_hadiths = [dict(zip(columns, row)) for row in rows]
    # Strip diacritics from text_ar in-place

    # Normalize and clean text_ar and narrator_name
    for h in all_hadiths:
        h["text_ar"] = normalize_whitespace(strip_diacritics(h["text_ar"]))
        if h.get("narrator_name"):
            h["narrator_name"] = normalize_whitespace(
                strip_diacritics(h["narrator_name"])
            )

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_hadiths, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(all_hadiths)} hadiths to {OUT_PATH}")
