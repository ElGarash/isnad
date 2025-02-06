import neo4j from 'neo4j-driver'
import { parseHadithRecords } from './schemas'

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'your_password')
)

export async function getIsnadByHadithId(hadithId: string) {
    const session = driver.session()
    try {
        const result = await session.run(`
            MATCH (n)-[r]->()
            WHERE r.HadithNo = $hadithId
            WITH r.HadithNo AS HadithNo, r.SanadNo AS SanadNo,
                collect({NarratorName: n.NarratorName, NarratorID: n.narID, NarratorGen: n.NarratorGen}) AS Narrators
            ORDER BY HadithNo, SanadNo
            WITH HadithNo, collect({SanadNo: SanadNo, Narrators: Narrators}) AS TransmissionChains
            RETURN HadithNo, TransmissionChains
        `, { hadithId })

        return parseHadithRecords([JSON.stringify(result.records[0])])
    } finally {
        await session.close()
    }
}

export async function getAllHadithIds() {
    const session = driver.session()
    try {
        const result = await session.run(`
            MATCH (n)-[r]->()
            RETURN DISTINCT r.HadithNo AS hadithId
        `)
        return result.records.map(record => record.get('hadithId'))
    } finally {
        await session.close()
    }
}
