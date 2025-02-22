import { Database } from "bun:sqlite";

export interface Hadith {
  id: string;
  hadith_id: number;
  source: string;
  chapter_no: number;
  hadith_no: string;
  chapter: string;
  text_ar: string;
  text_en: string;
  explanation: string;
}

export interface Narrator {
  scholar_indx: number;
  name: string;
  grade: string;
  parents: string;
  birth_date_hijri: string;
  birth_date_gregorian: string;
  death_date_hijri: string;
  death_date_gregorian: string;
  death_place: string;
}

export interface InfoSource {
  id: number;
  scholar_indx: number;
  book_source: string;
  content: string;
}

export type Source = "Sahih Bukhari";

export interface Chain {
  source: string;
  chapter_no: number;
  hadith_no: string;
  scholar_indx: number;
  position: number;
}

export type HadithWithChain = Hadith & Chain & Narrator;
export type HadithWithFirstNarrator = Hadith & { narrator_name?: string };

export interface ChapterCount {
  source: string;
  chapter: string;
  count: number;
}

let db: Database | null = null;
let statements: {
  getHadiths?: ReturnType<Database["prepare"]>;
  getAllHadiths?: ReturnType<Database["prepare"]>;
  getNarrators?: ReturnType<Database["prepare"]>;
  getHadithById?: ReturnType<Database["prepare"]>;
  getChainForHadith?: ReturnType<Database["prepare"]>;
  getHadithsBySource?: ReturnType<Database["prepare"]>;
  getNarratorByName?: ReturnType<Database["prepare"]>;
  getSuccessors?: ReturnType<Database["prepare"]>;
  getPredecessors?: ReturnType<Database["prepare"]>;
  getNarratorsInSource?: ReturnType<Database["prepare"]>;
  getNarratorSources?: ReturnType<Database["prepare"]>;
  getNarratorChapters?: ReturnType<Database["prepare"]>;
} = {};

function getDb() {
  if (!db) {
    db = new Database("data/sqlite.db");
    // Prepare statements
    statements.getHadiths = db.prepare(
      "SELECT * FROM hadiths ORDER BY id LIMIT $limit",
    );
    statements.getAllHadiths = db.prepare(`
            SELECT DISTINCT source, chapter_no, hadith_no
            FROM hadiths
            ORDER BY source, chapter_no, hadith_no`);
    statements.getNarrators = db.prepare("SELECT * FROM rawis");
    statements.getHadithById = db.prepare(`
            SELECT * FROM hadiths
            WHERE source = $source AND chapter_no = $chapter_no AND hadith_no = $hadith_no`);
    statements.getChainForHadith = db.prepare(`
            SELECT c.*, r.*
            FROM hadith_chains c
            JOIN rawis r ON c.scholar_indx = r.scholar_indx
            WHERE c.source = $source AND c.chapter_no = $chapter_no AND c.hadith_no = $hadith_no
            ORDER BY c.position`);
    statements.getHadithsBySource = db.prepare(`
      SELECT h.*, r.name as narrator_name
      FROM hadiths h
      LEFT JOIN hadith_chains c ON h.source = c.source
          AND h.chapter_no = c.chapter_no
          AND h.hadith_no = c.hadith_no
          AND c.position = 1
      LEFT JOIN rawis r ON c.scholar_indx = r.scholar_indx
      WHERE h.source = $source
      ORDER BY h.chapter_no, h.hadith_no
      LIMIT $limit`);
    statements.getNarratorByName = db.prepare(`
      SELECT * FROM rawis
      WHERE name = $name
    `);
    statements.getSuccessors = db.prepare(`
      SELECT DISTINCT r.*
      FROM hadith_chains c1
      JOIN hadith_chains c2 ON
        c1.source = c2.source AND
        c1.chapter_no = c2.chapter_no AND
        c1.hadith_no = c2.hadith_no AND
        c1.position = c2.position - 1
      JOIN rawis r ON c2.scholar_indx = r.scholar_indx
      WHERE c1.scholar_indx = $scholar_indx
      AND c1.source = $source
      ORDER BY r.name
    `);

    statements.getPredecessors = db.prepare(`
      SELECT DISTINCT r.*
      FROM hadith_chains c1
      JOIN hadith_chains c2 ON
        c1.source = c2.source AND
        c1.chapter_no = c2.chapter_no AND
        c1.hadith_no = c2.hadith_no AND
        c1.position = c2.position + 1
      JOIN rawis r ON c2.scholar_indx = r.scholar_indx
      WHERE c1.scholar_indx = $scholar_indx
      AND c1.source = $source
      ORDER BY r.name
    `);
    statements.getNarratorsInSource = db.prepare(`
      SELECT DISTINCT r.name
      FROM rawis r
      JOIN hadith_chains c ON r.scholar_indx = c.scholar_indx
      WHERE c.source = $source
      ORDER BY r.name
    `);
    statements.getNarratorSources = db.prepare(`
      SELECT * FROM sources
      WHERE scholar_indx = $scholar_indx
      ORDER BY LENGTH(content) DESC
      LIMIT 20
    `);
    statements.getNarratorChapters = db.prepare(`
      SELECT h.source, h.chapter, COUNT(DISTINCT h.hadith_no) as count
      FROM hadith_chains c
      JOIN hadiths h ON c.source = h.source
          AND c.chapter_no = h.chapter_no
          AND c.hadith_no = h.hadith_no
      WHERE c.scholar_indx = $scholar_indx
      AND c.source = $source
      GROUP BY h.source, h.chapter, h.chapter_no
      ORDER BY h.source ASC, h.chapter_no ASC`);
  }
  return db;
}

export function getHadiths(limit = 10): Hadith[] {
  getDb();
  return statements.getHadiths!.all({ $limit: limit }) as Hadith[];
}

export function getNarrators(): Narrator[] {
  getDb();
  return statements.getNarrators!.all() as Narrator[];
}

export function getHadithById(
  source: string,
  chapterNo: number,
  hadithNo: string,
): Hadith | null {
  getDb();
  return statements.getHadithById!.get({
    $source: source,
    $chapter_no: chapterNo,
    $hadith_no: hadithNo,
  }) as Hadith | null;
}

export function getChainForHadith(
  source: string,
  chapterNo: number,
  hadithNo: string,
): HadithWithChain[] {
  getDb();
  return statements.getChainForHadith!.all({
    $source: source,
    $chapter_no: chapterNo,
    $hadith_no: hadithNo,
  }) as HadithWithChain[];
}

export function getAllHadiths(): Hadith[] {
  getDb();
  return statements.getAllHadiths!.all() as Hadith[];
}

export function getHadithsBySource(
  source: Source,
  limit: number,
): HadithWithFirstNarrator[] {
  getDb();
  return statements.getHadithsBySource!.all({
    $source: source,
    $limit: limit,
  }) as HadithWithFirstNarrator[];
}

export function getNarrator(name: string): Narrator | undefined {
  getDb();
  return statements.getNarratorByName!.get({
    $name: name,
  }) as Narrator | undefined;
}

export function getNarratorInfo(scholarIndex: number): InfoSource[] {
  getDb();
  return statements.getNarratorSources!.all({
    $scholar_indx: scholarIndex,
  }) as InfoSource[];
}

export function getSuccessors(
  scholarIndex: number,
  source: Source,
): Narrator[] {
  getDb();
  return statements.getSuccessors!.all({
    $scholar_indx: scholarIndex,
    $source: source,
  }) as Narrator[];
}

export function getPredecessors(
  scholarIndex: number,
  source: Source,
): Narrator[] {
  getDb();
  return statements.getPredecessors!.all({
    $scholar_indx: scholarIndex,
    $source: source,
  }) as Narrator[];
}

export function getNarratorsInSource(source: Source): string[] {
  getDb();
  return (
    statements.getNarratorsInSource!.all({ $source: source }) as {
      name: string;
    }[]
  ).map((row) => row.name);
}

export function narratedAbout(
  scholarIndex: number,
  source: Source,
): ChapterCount[] {
  getDb();
  return statements.getNarratorChapters!.all({
    $scholar_indx: scholarIndex,
    $source: source,
  }) as ChapterCount[];
}

export function close() {
  if (db) {
    // Clean up prepared statements
    Object.values(statements).forEach((stmt) => stmt?.finalize());
    statements = {};
    db.close();
    db = null;
  }
}
