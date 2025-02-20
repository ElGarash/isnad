import json
import polars as pl
import sqlite3
from pathlib import Path


def create_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
    CREATE TABLE hadiths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hadith_id INTEGER,
        source TEXT,
        chapter_no INTEGER,
        hadith_no TEXT,
        chapter TEXT,
        text_ar TEXT,
        text_en TEXT,
        explanation TEXT,
        UNIQUE(source, chapter_no, hadith_no)
    );

    CREATE TABLE rawis (
        scholar_indx INTEGER PRIMARY KEY,
        name TEXT,
        full_name TEXT,
        grade TEXT,
        parents TEXT,
        birth_date_hijri TEXT,
        birth_date_gregorian TEXT,
        death_date_hijri TEXT,
        death_date_gregorian TEXT,
        death_place TEXT
    );

    CREATE TABLE hadith_chains (
        source TEXT,
        chapter_no INTEGER,
        hadith_no TEXT,
        scholar_indx INTEGER,
        position INTEGER,
        FOREIGN KEY(source, chapter_no, hadith_no) REFERENCES hadiths(source, chapter_no, hadith_no),
        FOREIGN KEY(scholar_indx) REFERENCES rawis(scholar_indx),
        PRIMARY KEY(source, chapter_no, hadith_no, scholar_indx)
    );

    CREATE TABLE sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scholar_indx INTEGER,
        book_source TEXT,
        content TEXT,
        FOREIGN KEY(scholar_indx) REFERENCES rawis(scholar_indx)
    );

    -- Indexes for hadiths table (read-heavy optimization)
    CREATE INDEX idx_hadiths_hadith_id ON hadiths(hadith_id);
    CREATE INDEX idx_hadiths_source_chapter ON hadiths(source, chapter_no);  -- For chapter browsing
    CREATE INDEX idx_hadiths_text_ar ON hadiths(text_ar);  -- For Arabic text search
    CREATE INDEX idx_hadiths_text_en ON hadiths(text_en);  -- For English text search

    -- Indexes for rawis table (read-heavy optimization)
    CREATE INDEX idx_rawis_name ON rawis(name);
    CREATE INDEX idx_rawis_full_name ON rawis(full_name);
    CREATE INDEX idx_rawis_grade ON rawis(grade);  -- For filtering by scholar grade
    CREATE INDEX idx_rawis_death_date ON rawis(death_date_hijri, death_date_gregorian);  -- For timeline queries

    -- Indexes for hadith_chains table (read-heavy optimization)
    CREATE INDEX idx_chains_scholar_pos ON hadith_chains(scholar_indx, position);  -- Combined index for chain analysis
    CREATE INDEX idx_chains_source_scholar ON hadith_chains(source, scholar_indx);  -- For finding scholar's hadiths

    -- Index for sources table
    CREATE INDEX idx_sources_scholar ON sources(scholar_indx);
    """
    )


def insert_sources(conn: sqlite3.Connection) -> None:
    """Insert sources data from JSON file"""
    with open(Path("data/scholars_sources.json")) as f:
        sources_data = json.load(f)

    # Convert nested JSON to DataFrame
    sources_df = (
        pl.DataFrame(
            {
                "scholar_id": [entry["scholar_id"] for entry in sources_data],
                "sources": [entry["sources"] for entry in sources_data],
            }
        )
        .explode("sources")
        .select(
            pl.col("scholar_id"),
            pl.col("sources").struct.field("book_source"),
            pl.col("sources").struct.field("content"),
        )
    )

    # Convert to list of tuples for executemany
    values = list(sources_df.iter_rows())

    conn.executemany(
        "INSERT INTO sources (scholar_indx, book_source, content) VALUES (?, ?, ?)",
        values,
    )


def clean_arabic_text(original: str) -> str:
    clean = (
        (original or "")
        .translate(
            str.maketrans(
                "",
                "",
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-'(),.‘`/#1234567890",
            )
        )
        # It has to be done in this order, because the second replace is a subset of the first.
        .replace("رضي الله عنها", "")
        .replace("رضي الله عنه", "")
        .strip()
    )

    if clean == "":
        # Should get rid of this after fixing https://github.com/ElGarash/isnad/issues/18
        return original

    return clean


def load_explanations() -> pl.DataFrame:
    """Load hadith explanations and join with mapped hadiths to create mapping of hadith_no -> explanation"""
    explanations_df = pl.read_csv(
        "data/open_hadith_explanations.csv",
        has_header=False,
        new_columns=["hadith_id", "hadith_text", "explanation"],
    )

    # Create mapping from matched_hadiths.csv and normalize hadith_no
    matches_df = pl.read_csv("data/matched_hadiths.csv").with_columns(
        pl.col("hadith_no").str.strip_chars().str.replace(r"\s+", " ")
    )

    # Join the dataframes to get hadith_no -> explanation mapping
    return matches_df.join(
        explanations_df, left_on="open_hadith_id", right_on="hadith_id", how="left"
    ).select(["hadith_no", "explanation"])


def insert_hadiths(conn: sqlite3.Connection, hadiths_df: pl.DataFrame) -> None:
    """Insert hadiths into SQLite database"""
    # Load explanations mapping
    explanations_df = load_explanations()

    hadiths_df = (
        hadiths_df.with_columns(
            [
                pl.col("source").str.strip_chars(),
                pl.col("hadith_no").str.strip_chars(),
            ]
        )
        .join(explanations_df, on="hadith_no", how="left")
        .with_columns(
            [
                # Only keep explanations for Bukhari hadiths
                pl.when(pl.col("source") == "Sahih Bukhari")
                .then(pl.col("explanation"))
                .otherwise(None)
                .alias("explanation")
            ]
        )
    )

    hadiths_df.select(
        [
            "hadith_id",
            pl.col("source").map_elements(
                lambda x: "Bukhari" if x == "Sahih Bukhari" else x, return_dtype=pl.Utf8
            ),
            "chapter_no",
            "hadith_no",
            "chapter",
            "text_ar",
            "text_en",
            "explanation",
        ]
    ).to_pandas().to_sql("hadiths", conn, if_exists="append", index=False)


def insert_rawis(conn: sqlite3.Connection, rawis_df: pl.DataFrame) -> None:
    rawis_df.select(
        [
            "scholar_indx",
            pl.col("name").map_elements(clean_arabic_text, return_dtype=pl.Utf8),
            "full_name",
            "grade",
            "parents",
            "birth_date_hijri",
            "birth_date_gregorian",
            "death_date_hijri",
            "death_date_gregorian",
            "death_place",
        ]
    ).to_pandas().to_sql("rawis", conn, if_exists="append", index=False)


def insert_chains(conn: sqlite3.Connection, hadiths_df: pl.DataFrame) -> None:
    chains = (
        hadiths_df.with_columns(
            [
                pl.col("source")
                .str.strip_chars()
                .map_elements(
                    lambda x: "Bukhari" if x == "Sahih Bukhari" else x,
                    return_dtype=pl.Utf8,
                ),
                pl.col("hadith_no").str.strip_chars(),
                pl.col("chain_indx")
                .str.strip_chars()
                .str.split(",")
                .list.eval(pl.element().str.strip_chars())
                .cast(pl.List(pl.Int64))
                .alias("scholar_indices"),
            ]
        )
        .explode("scholar_indices")
        .unique(
            subset=["source", "chapter_no", "hadith_no", "scholar_indices"],
            keep="first",
        )
        .with_columns(
            [
                pl.col("scholar_indices").cast(pl.Int64),
                pl.col("scholar_indices")
                .rank("dense")
                .over(["source", "chapter_no", "hadith_no"])
                .alias("position"),
            ]
        )
        .select(
            [
                "source",
                "chapter_no",
                "hadith_no",
                pl.col("scholar_indices").alias("scholar_indx"),
                "position",
            ]
        )
    ).to_pandas()

    chains.to_sql("hadith_chains", conn, if_exists="append", index=False)


def main() -> None:
    hadiths_df = pl.read_csv(Path("data/hadiths.csv"))
    rawis_df = pl.read_csv(Path("data/rawis.csv"))

    # FIXME: these aren't actually duplicates, but something is wrong with the data.
    # remove duplicates,
    unique_hadiths = hadiths_df.unique(
        subset=["source", "chapter_no", "hadith_no"], keep="first"
    )

    db_path = Path("data/sqlite.db")
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(db_path)

    try:
        create_tables(conn)
        insert_hadiths(conn, unique_hadiths)
        insert_rawis(conn, rawis_df)
        insert_chains(conn, unique_hadiths)
        insert_sources(conn)
        conn.commit()

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        conn.close()


if __name__ == "__main__":
    main()
