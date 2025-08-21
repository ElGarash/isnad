import {
  close,
  getChainForHadith,
  getHadithById,
  getHadiths,
  getHadithsFromNarratorToNarrator,
  getNarratorPairs,
  getNarrators,
} from "../lib/sqlite";
import { afterAll, describe, expect, test } from "bun:test";

describe("SQLite Database Tests", () => {
  afterAll(() => {
    close();
  });

  test("getHadiths returns array of hadiths", () => {
    const hadiths = getHadiths();
    expect(hadiths).toBeArray();
    expect(hadiths.length).toBeGreaterThan(0);
    const hadith = hadiths[0];
    expect(hadith).toHaveProperty("hadith_id");
    expect(hadith).toHaveProperty("source");
    expect(hadith).toHaveProperty("chapter_no");
    expect(hadith).toHaveProperty("hadith_no");
    expect(hadith).toHaveProperty("chapter");
    expect(hadith).toHaveProperty("text_ar");
    expect(hadith).toHaveProperty("text_en");
  });

  test("getNarrators returns array of narrators", () => {
    const narrators = getNarrators();
    expect(narrators).toBeArray();
    expect(narrators.length).toBeGreaterThan(0);
    const narrator = narrators[0];
    expect(narrator).toHaveProperty("scholar_indx");
    expect(narrator).toHaveProperty("name");
    expect(narrator).toHaveProperty("grade");
    expect(narrator).toHaveProperty("parents");
  });

  test("getHadithById returns specific hadith", () => {
    // Use first hadith from getHadiths as a known good record
    const hadiths = getHadiths(1);
    const sample = hadiths[0];

    const hadith = getHadithById(
      sample.source,
      sample.chapter,
      sample.hadith_no,
    );
    expect(hadith).toMatchObject(sample);
  });

  test("getHadithById returns null for non-existent hadith", () => {
    const hadith = getHadithById("invalid", "doesn't exist", "999");
    expect(hadith).toBeNull();
  });

  test("getChainForHadith returns narrator chain", () => {
    // Use first hadith to test its chain
    const hadiths = getHadiths(1);
    const sample = hadiths[0];

    const chain = getChainForHadith(
      sample.source,
      sample.chapter,
      sample.hadith_no,
    );
    expect(chain).toBeArray();
    expect(chain.length).toBeGreaterThan(0);
    const chainItem = chain[0];
    expect(chainItem).toHaveProperty("scholar_indx");
    expect(chainItem).toHaveProperty("name");
    expect(chainItem).toHaveProperty("source");
    expect(chainItem).toHaveProperty("chapter_no");
    expect(chainItem).toHaveProperty("hadith_no");
    expect(chainItem).toHaveProperty("position");
  });

  test("getHadiths returns consistent results", () => {
    const firstRun = getHadiths(10);
    const secondRun = getHadiths(10);

    expect(firstRun).toHaveLength(10);
    expect(secondRun).toHaveLength(10);

    // Compare each hadith's ID to ensure exact same order
    firstRun.forEach((hadith, index) => {
      expect(hadith.id).toBe(secondRun[index].id);
    });
  });

  test("getHadiths returns sorted results", () => {
    const hadiths = getHadiths(10);

    // Verify that IDs are in ascending order
    for (let i = 1; i < hadiths.length; i++) {
      expect(parseInt(hadiths[i].id, 10)).toBeGreaterThan(
        parseInt(hadiths[i - 1].id, 10),
      );
    }
  });
});

describe("Hadith 6800 retrieval", () => {
  test("should find Sahih Bukhari 1:3", () => {
    const hadith = getHadithById("Sahih Bukhari", "كتاب بدء الوحى", "3");
    expect(hadith).not.toBeNull();
    expect(hadith).toMatchObject({
      hadith_id: 3,
      source: "Sahih Bukhari",
      chapter_no: 1,
      hadith_no: "3",
      chapter: "كتاب بدء الوحى",
    });
    expect(hadith?.text_en).toContain(
      "The commencement of the Divine Inspiration",
    );
    expect(hadith?.explanation).not.toBeNull();
  });

  test("should have correct chain for 1:2", () => {
    const chain = getChainForHadith("Sahih Bukhari", "كتاب بدء الوحى", "2");
    expect(chain).toHaveLength(5);

    // Verify specific narrators
    const expectedNarrators = [
      "أمّ المؤمنين عائشة بنت أبي بكر الصديق",
      "عروة بن الزبير",
      "هشام بن عروة",
      "مالك بن أنس بن مالك بن أبي عامر",
      "عبد الله بن يوسف التنيسي",
    ];
    chain.forEach((narrator, idx) => {
      expect(narrator.name).toStrictEqual(expectedNarrators[idx]);
      expect(narrator.position).toBe(idx + 1);
    });
  });

  test("getHadithsFromNarratorToNarrator returns hadiths narrated from one narrator to another", () => {
    // First get some narrators to test with
    const narrators = getNarrators();
    expect(narrators.length).toBeGreaterThan(1);

    // Use first two narrators for testing
    const fromNarrator = narrators[0].name;
    const toNarrator = narrators[1].name;

    const hadiths = getHadithsFromNarratorToNarrator(
      fromNarrator,
      toNarrator,
      "Sahih Bukhari",
      10,
    );
    expect(hadiths).toBeArray();

    // Each hadith should have all required properties for HadithWithFirstNarrator interface
    hadiths.forEach((hadith) => {
      expect(hadith).toHaveProperty("id");
      expect(hadith).toHaveProperty("hadith_id");
      expect(hadith).toHaveProperty("source");
      expect(hadith).toHaveProperty("chapter_no");
      expect(hadith).toHaveProperty("hadith_no");
      expect(hadith).toHaveProperty("chapter");
      expect(hadith).toHaveProperty("text_ar");
      expect(hadith).toHaveProperty("text_en");
      expect(hadith).toHaveProperty("explanation");
      expect(hadith).toHaveProperty("narrator_name");
    });
  });

  test("getNarratorPairs returns narrator pairs with hadith counts", () => {
    const pairs = getNarratorPairs("Sahih Bukhari");
    expect(pairs).toBeArray();

    // Each pair should have the required properties
    pairs.forEach((pair) => {
      expect(pair).toHaveProperty("from_narrator");
      expect(pair).toHaveProperty("to_narrator");
      expect(pair).toHaveProperty("hadith_count");
      expect(typeof pair.from_narrator).toBe("string");
      expect(typeof pair.to_narrator).toBe("string");
      expect(typeof pair.hadith_count).toBe("number");
      expect(pair.hadith_count).toBeGreaterThan(0);
    });
  });

  afterAll(() => {
    close();
  });
});
