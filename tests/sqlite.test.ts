import {
  close,
  getChainForHadith,
  getHadithById,
  getHadiths,
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
      sample.chapter_no,
      sample.hadith_no,
    );
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

    const chain = getChainForHadith(
      sample.source,
      sample.chapter_no,
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
      expect(hadiths[i].id).toBeGreaterThan(hadiths[i - 1].id);
    }
  });
});

describe("Hadith 6800 retrieval", () => {
  test("should find Sahih Bukhari 84:6800", () => {
    const hadith = getHadithById("Sahih Bukhari", 1, "3");
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

  test("should have correct chain for 84:6800", () => {
    const chain = getChainForHadith("Sahih Bukhari", 84, "6800");
    expect(chain).toHaveLength(8);

    // Verify specific narrators
    const expectedNarrators = [
      "أبو هريرة  عبد الرحمن بن صخر الدوسي",
      "علي بن الحسين بن علي  زين العابدين",
      "زيد بن أسلم",
      "سعيد بن مرجانة",
      "محمد بن مطرف",
      "الوليد بن مسلم القرشي",
      "داود بن رشيد",
      "محمد بن عبد الرحيم بن أبي زهير البزاز",
    ];
    chain.forEach((narrator, idx) => {
      expect(narrator.name).toStrictEqual(expectedNarrators[idx]);
      expect(narrator.position).toBe(idx + 1);
    });
  });

  afterAll(() => {
    close();
  });
});
