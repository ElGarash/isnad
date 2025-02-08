import { expect, test, describe, afterAll } from "bun:test";
import { getHadiths, getNarrators, getHadithById, getChainForHadith, close } from "../lib/sqlite";

describe("SQLite Database Tests", () => {
    afterAll(() => {
        close();
    });

    test("getHadiths returns array of hadiths", () => {
        const hadiths = getHadiths();
        expect(hadiths).toBeArray();
        expect(hadiths.length).toBeGreaterThan(0);
        const hadith = hadiths[0];
        expect(hadith).toHaveProperty('hadith_id');
        expect(hadith).toHaveProperty('source');
        expect(hadith).toHaveProperty('chapter_no');
        expect(hadith).toHaveProperty('hadith_no');
        expect(hadith).toHaveProperty('chapter');
        expect(hadith).toHaveProperty('text_ar');
        expect(hadith).toHaveProperty('text_en');
    });

    test("getNarrators returns array of narrators", () => {
        const narrators = getNarrators();
        expect(narrators).toBeArray();
        expect(narrators.length).toBeGreaterThan(0);
        const narrator = narrators[0];
        expect(narrator).toHaveProperty('scholar_indx');
        expect(narrator).toHaveProperty('name');
        expect(narrator).toHaveProperty('grade');
        expect(narrator).toHaveProperty('parents');
    });

    test("getHadithById returns specific hadith", () => {
        // Use first hadith from getHadiths as a known good record
        const hadiths = getHadiths(1);
        const sample = hadiths[0];

        const hadith = getHadithById(sample.source, sample.chapter_no, sample.hadith_no);
        expect(hadith).toMatchObject(sample);
    });

    test("getHadithById returns null for non-existent hadith", () => {
        const hadith = getHadithById("invalid", 999, "999");
        expect(hadith).toBeNull();
    });

    test("getChainForHadith returns narrator chain", () => {
        // Use first hadith to test its chain
        const hadiths = getHadiths(1);
        const sample = hadiths[0];

        const chain = getChainForHadith(sample.source, sample.chapter_no, sample.hadith_no);
        expect(chain).toBeArray();
        expect(chain.length).toBeGreaterThan(0);
        const chainItem = chain[0];
        expect(chainItem).toHaveProperty('scholar_indx');
        expect(chainItem).toHaveProperty('name');
        expect(chainItem).toHaveProperty('source');
        expect(chainItem).toHaveProperty('chapter_no');
        expect(chainItem).toHaveProperty('hadith_no');
        expect(chainItem).toHaveProperty('position');
    });
});
