OPTIONAL MATCH (h:Hadith)
WITH COUNT(h) AS hadithCount

CALL apoc.do.when(
    hadithCount = 0,
    '
    CALL apoc.load.xls("file:///import/data/Hadith_Content.xlsx", "Sheet1") YIELD map
    MERGE (b:Book {BookNo: map.BookNo, BookTitleEnAr: map.BookTitleEnAr})
    MERGE (c:Chapter {ChapterNo: map.ChapterNo, ChapterTitleAr: map.ChapterTitleAr, ChapterTitleEn: coalesce(map.ChapterTitleEn, "")})
    MERGE (u:Unit {UnitNo: map.UnitNo, UnitTitleAr: map.UnitTitleAr})
    MERGE (h:Hadith {HadithNo: map.HadithNo, HadithText_Mushakkal: coalesce(map.HadithText_Mushakkal, ""), HadithText_GhairMushakkal: coalesce(map.HadithText_GhairMushakkal, ""), SanadCount: map.SanadCount, SanadWithNarratorsCount: map.SanadWithNarratorsCount})
    MERGE (h)-[:BELONGS_TO]->(u)
    MERGE (u)-[:PART_OF]->(c)
    MERGE (c)-[:PART_OF]->(b)
    ',
    '',
    {}
) YIELD value

OPTIONAL MATCH (n:Narrator)
WITH COUNT(n) AS narratorCount

CALL apoc.do.when(
    narratorCount = 0,
    '
    CALL apoc.load.xls("file:///import/data/Nodes.xlsx", "1-Nodes") YIELD map
    MERGE (n:Narrator {NarratorID_Mapped: map.NarratorID_Mapped, NarratorNameAr: map.NarratorNameAr, NarratorNameArMapped: map.`NarratorNameAr-Mapped`, NarratorNameEnMapped: map.`NarratorNameEn-Mapped`, Gender: map.Gender, NarratorGeneration: map.NarratorGeneration})
    ',
    '',
    {}
) YIELD value

OPTIONAL MATCH ()-[r:INTERACTION]-()
WITH COUNT(r) AS relationshipCount

CALL apoc.do.when(
    relationshipCount = 0,
    '
    CALL apoc.load.xls("file:///import/data/Edges.xlsx", "2-Relationship") YIELD map
    MATCH (source:Narrator {NarratorID_Mapped: map.sourceNarratorID})
    MATCH (target:Narrator {NarratorID_Mapped: map.targetNarratorID})
    MERGE (source)-[r:INTERACTION {BookNo: map.BookNo, HadithNo: map.HadithNo, ChapterNo: map.ChapterNo, UnitNo: map.UnitNo, SanadNo: map.SanadNo, intractionLabel: map.intractionLabel}]->(target)
    SET r.sourceNarratorNameEn = map.sourceNarratorNameEn,
        r.sourceNarratorGen = map.sourceNarratorGen,
        r.sourceNarratorGender = map.sourceNarratorGender,
        r.targetNarratorNameEn = map.targetNarratorNameEn,
        r.targetNarratorGen = map.targetNarratorGen,
        r.targetNarratorGender = map.targetNarratorGender
    ',
    '',
    {}
) YIELD value

RETURN ""

