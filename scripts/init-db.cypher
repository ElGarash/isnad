CALL apoc.load.xls('file:///import/data/Hadith_Content.xlsx', 'Sheet1') YIELD map AS row
MERGE (b:Book {BookNo: row.BookNo, BookTitleEnAr: row.BookTitleEnAr})
MERGE (c:Chapter {ChapterNo: row.ChapterNo, ChapterTitleAr: row.ChapterTitleAr, ChapterTitleEn: coalesce(row.ChapterTitleEn, "")})
MERGE (u:Unit {UnitNo: row.UnitNo, UnitTitleAr: row.UnitTitleAr})
MERGE (h:Hadith {HadithNo: row.HadithNo, HadithText_Mushakkal: coalesce(row.HadithText_Mushakkal, ""), HadithText_GhairMushakkal: coalesce(row.HadithText_GhairMushakkal, ""), SanadCount: row.SanadCount, SanadWithNarratorsCount: row.SanadWithNarratorsCount})
MERGE (h)-[:BELONGS_TO]->(u)
MERGE (u)-[:PART_OF]->(c)
MERGE (c)-[:PART_OF]->(b);


CALL apoc.load.xls('file:///import/data/Nodes.xlsx', '1-Nodes') YIELD map AS row
MERGE (n:Narrator {NarratorID_Mapped: row.NarratorID_Mapped, NarratorNameAr: row.NarratorNameAr, NarratorNameArMapped: row.`NarratorNameAr-Mapped`, NarratorNameEnMapped: row.`NarratorNameEn-Mapped`, Gender: row.Gender, NarratorGeneration: row.NarratorGeneration});


CALL apoc.load.xls('file:///import/data/Edges.xlsx', '2-Relationship') YIELD map AS row
MATCH (source:Narrator {NarratorID_Mapped: row.sourceNarratorID})
MATCH (target:Narrator {NarratorID_Mapped: row.targetNarratorID})
MERGE (source)-[r:INTERACTION {BookNo: row.BookNo, HadithNo: row.HadithNo, ChapterNo: row.ChapterNo, UnitNo: row.UnitNo, SanadNo: row.SanadNo, intractionLabel: row.intractionLabel}]->(target)
SET r.sourceNarratorNameEn = row.sourceNarratorNameEn,
    r.sourceNarratorGen = row.sourceNarratorGen,
    r.sourceNarratorGender = row.sourceNarratorGender,
    r.targetNarratorNameEn = row.targetNarratorNameEn,
    r.targetNarratorGen = row.targetNarratorGen,
    r.targetNarratorGender = row.targetNarratorGender;


