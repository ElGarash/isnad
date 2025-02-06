import neo4j from 'neo4j-driver'
import { parseHadithRecords } from './schemas'

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'your_password')
)

export async function getPeopleAndLinks() {
    const session = driver.session()
    try {
        const result = await session.run(`
            MATCH (n)-[r]->()
            WHERE r.HadithNo IS NOT NULL
            WITH r.HadithNo AS HadithNo, r.SanadNo AS SanadNo,
                collect({NarratorName: n.NarratorName, NarratorID: n.narID, NarratorGen: n.NarratorGen}) AS Narrators
            ORDER BY HadithNo, SanadNo
            WITH HadithNo, collect({SanadNo: SanadNo, Narrators: Narrators}) AS TransmissionChains
            RETURN HadithNo, TransmissionChains
            LIMIT 10
        `)

        return parseHadithRecords(result.records.map(r => JSON.stringify(r)))
    } finally {
        await session.close()
    }
}
