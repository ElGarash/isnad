import { Database } from 'bun:sqlite'

export interface Hadith {
    id: number;
    hadith_id: number;
    source: string;
    chapter_no: number;
    hadith_no: string;
    chapter: string;
    text_ar: string;
    text_en: string;
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

export interface Chain {
    source: string;
    chapter_no: number;
    hadith_no: string;
    scholar_indx: number;
    position: number;
}

export type HadithWithChain = Hadith & Chain;

let db: Database | null = null;
let statements: {
    getHadiths?: ReturnType<Database['prepare']>,
    getNarrators?: ReturnType<Database['prepare']>,
    getHadithById?: ReturnType<Database['prepare']>,
    getChainForHadith?: ReturnType<Database['prepare']>,
} = {};

function getDb() {
    if (!db) {
        db = new Database('data/sqlite.db');
        // Prepare statements
        statements.getHadiths = db.prepare('SELECT * FROM hadiths LIMIT $limit');
        statements.getNarrators = db.prepare('SELECT * FROM rawis');
        statements.getHadithById = db.prepare(`
            SELECT * FROM hadiths 
            WHERE source = $source AND chapter_no = $chapter_no AND hadith_no = $hadith_no`);
        statements.getChainForHadith = db.prepare(`
            SELECT c.*, r.* 
            FROM hadith_chains c
            JOIN rawis r ON c.scholar_indx = r.scholar_indx
            WHERE c.source = $source AND c.chapter_no = $chapter_no AND c.hadith_no = $hadith_no
            ORDER BY c.position`);
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

export function getHadithById(source: string, chapterNo: number, hadithNo: string): Hadith | null {
    getDb();
    return statements.getHadithById!.get({
        $source: source,
        $chapter_no: chapterNo,
        $hadith_no: hadithNo
    }) as Hadith | null;
}

export function getChainForHadith(source: string, chapterNo: number, hadithNo: string): (HadithWithChain)[] {
    getDb();
    return statements.getChainForHadith!.all({
        $source: source,
        $chapter_no: chapterNo,
        $hadith_no: hadithNo
    }) as (HadithWithChain)[];
}

export function close() {
    if (db) {
        // Clean up prepared statements
        Object.values(statements).forEach(stmt => stmt?.finalize());
        statements = {};
        db.close();
        db = null;
    }
}
