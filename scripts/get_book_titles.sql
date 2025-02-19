SELECT DISTINCT
    TRIM(SUBSTR(
        book_source,
        INSTR(book_source, '-') + 1,
        INSTR(book_source, '[') - INSTR(book_source, '-') - 1
    )) as arabic_title
FROM sources
WHERE book_source LIKE '%-%[%'
ORDER BY arabic_title;
-- sqlite3 data/sqlite.db < scripts/get_book_titles.sql
