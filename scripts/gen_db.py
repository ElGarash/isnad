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
        UNIQUE(source, chapter_no, hadith_no)
    );

    CREATE TABLE rawis (
        scholar_indx INTEGER PRIMARY KEY,
        name TEXT,
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
    """
    )


def insert_hadiths(conn: sqlite3.Connection, hadiths_df: pl.DataFrame) -> None:
    """Insert hadiths data"""

    hadiths = hadiths_df.select(
        [
            "hadith_id",
            "source",
            "chapter_no",
            "hadith_no",
            "chapter",
            "text_ar",
            "text_en",
        ]
    ).to_pandas()

    hadiths.to_sql("hadiths", conn, if_exists="append", index=False)


def insert_rawis(conn: sqlite3.Connection, rawis_df: pl.DataFrame) -> None:
    """Insert rawis data"""

    rawis = rawis_df.select(
        [
            "scholar_indx",
            "name",
            "grade",
            "parents",
            "birth_date_hijri",
            "birth_date_gregorian",
            "death_date_hijri",
            "death_date_gregorian",
            "death_place",
        ]
    ).to_pandas()

    rawis.to_sql("rawis", conn, if_exists="append", index=False)


def insert_chains(conn: sqlite3.Connection, hadiths_df: pl.DataFrame) -> None:
    chains = (
        hadiths_df.with_columns(
            [
                pl.col("chain_indx")
                .str.strip_chars()
                .str.split(",")
                .list.eval(pl.element().str.strip_chars())
                .cast(pl.List(pl.Int64))
                .alias("scholar_indices")
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
        conn.commit()

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        conn.close()


if __name__ == "__main__":
    main()
