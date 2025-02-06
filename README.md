# Multi-IsnadSet (MIDS) for Sahih Muslim Hadith

This repository contains a Neo4j Docker setup that automatically seeds the database with the [Multi-IsnadSet (MIDS) for Sahih Muslim](https://data.mendeley.com/datasets/gzprcr93zn/2)

## Prerequisites

- Docker

## How to Use

1. Clone this repository:

   ```bash
   git clone https://github.com/your-repo/neo4j-seed.git
   cd neo4j-seed
   ```

2. Deploy `Neo4j` Database and seed the database

   ```bash
   docker compose up --build
   ```

## Queries

1. To find each hadith along with its transmission chains

   ```neo4j
   MATCH (n)-[r]->()
   WHERE r.HadithNo IS NOT NULL
   WITH r.HadithNo AS HadithNo, r.SanadNo AS SanadNo,
      collect({NarratorName: n.NarratorName, NarratorID: n.narID, NarratorGen: n.NarratorGen}) AS Narrators
   ORDER BY HadithNo, SanadNo
   WITH HadithNo, collect({SanadNo: SanadNo, Narrators: Narrators}) AS TransmissionChains
   RETURN HadithNo, TransmissionChains
   ```

2. To finds the hadiths narrated by each person

   ```neo4j
   MATCH (n)-[r]->(h)
   WITH n.NarratorName AS NarratorName, labels(n) AS NarratorType, collect({HadithNo: r.HadithNo, SanadNo: r.SanadNo}) AS Hadiths
   RETURN NarratorName, NarratorType, Hadiths
   ORDER BY NarratorName
   LIMIT 10;
   ```
