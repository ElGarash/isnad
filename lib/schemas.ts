import { z } from 'zod'

// Individual narrator schema
const narratorSchema = z.object({
    NarratorID: z.string(),
    NarratorName: z.string(),
    NarratorGen: z.string()
})

// Chain of narrators schema
const transmissionChainSchema = z.object({
    SanadNo: z.string(),
    Narrators: z.array(narratorSchema)
})

// Complete hadith record schema
const hadithRecordSchema = z.object({
    keys: z.array(z.string()),
    length: z.number(),
    _fields: z.tuple([
        z.string(), // HadithNo
        z.array(transmissionChainSchema) // TransmissionChains
    ]),
    _fieldLookup: z.object({
        HadithNo: z.number(),
        TransmissionChains: z.number()
    })
})

// Array of hadith records schema
export const hadithRecordsSchema = z.array(
    hadithRecordSchema.transform((record) => ({
        hadithNo: record._fields[0],
        transmissionChains: record._fields[1]
    }))
)

export type HadithRecord = z.infer<typeof hadithRecordSchema>
export type TransmissionChain = z.infer<typeof transmissionChainSchema>
export type Narrator = z.infer<typeof narratorSchema>

// Parser function
export function parseHadithRecords(jsonStrings: string[]) {
    return hadithRecordsSchema.parse(
        jsonStrings.map(str => JSON.parse(str))
    )
}
