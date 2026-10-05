# How to Prepare Data Through Phase 3

Technical owner: M2. Clinical reviewer: M3. Frontend/ML consumer: M1.
Objective: prepare one reviewed synthetic patient fixture that every service interprets consistently.
Roadmap: [Project phases](../docs/PROJECT_PHASES.md).

## How to Use This Guide

Read [TODO.md](TODO.md) for the full checklist; this guide explains how to work through it.
M1 = fullstack + Python ML coordination. M2 = Spring Boot + MQTT + digital twin. M3 = BPharma healthcare lead.
These instructions cover Phases 1-3. The services, fixtures, and commands described below are planned; this document does not claim they already exist or have passed tests.

A folder is ready when its completion checks pass and the named reviewer has checked the handoff. The whole phase is done only when all required folders meet the gate in the project roadmap.
Record evidence and review notes in docs/PHASE_STATUS.md when that file is created. Use Pending, In progress, Ready for review, Blocked, or Done. Leave TODO boxes unchecked until the relevant check passes.
For a dependency question, send the file/revision, a concrete example, expected behavior, actual behavior, and the decision needed. Continue independent work while waiting; do not silently guess a shared field or clinical definition.

## Tools You Will Use

| Tool | Who uses it and why |
| --- | --- |
| Markdown table or a simple spreadsheet for review | M3 explains fields and reviews values |
| JSON editor and PowerShell ConvertFrom-Json | M2 creates and checks the canonical fixture |
| Spring/Jackson and JUnit | M2 validates imports and repeatability |
| Browser and backend API responses | M1/M3 compare displayed values with the fixture |
| Git | Track the exact reviewed fixture revision |

CSV is optional if consumed by code. Parquet, large generators, and training splits are Phase 5 work.
Synthea is a future synthetic-data option, not required for one manually prepared Phase 3 fixture.

## Phase 1: Agree What Each Field Means

1. M3 writes a short fictional patient scenario in plain language. Avoid real names, contact details, and copied patient records.
2. M2 and M1 list the minimum fields needed for the first screen and mock request. Add no field just because it might be useful much later.
3. In docs/DATA_DICTIONARY.md, give each field a name, meaning, type, unit, required/optional status, and example. M3 supplies meaning; developers supply machine rules.
4. Distinguish long-term EHR information from time-stamped CGM readings. M3 can use [NIDDK's A1C explanation](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test) and [CGM overview](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring) as introductory references.
5. Agree patient ID P001, one fixed historical time window, sampling interval, and a UTC as-of timestamp. Decide missing-value handling.
6. Ask M3 to review the scenario/values and document the basis. These sources explain clinical concepts; they do not validate a synthetic dataset or prescribe the model's spike definition.
7. Keep the mock risk response out of the measurement dataset. A fixed demonstration probability is not a recorded clinical outcome.

### Ask for Input Before Proceeding

| When | Ask | Send | Continue after |
| --- | --- | --- | --- |
| Before selecting clinical units/values | M3 | Small field/value table and scenario | Meanings and plausibility reviewed |
| Before fixing JSON structure | M1 | Draft field names and nested structure | Frontend/ML consumption agreed |
| If a value or unit is unclear | M3, with M1/M2 for schema impact | Exact field and competing interpretations | A documented definition is chosen |

While waiting, prepare the table and import validation checklist; leave uncertain values clearly unresolved.

### Mark Phase 1 Done for Data When

- [ ] Data dictionary and fictional scenario exist.
- [ ] M3 reviews meanings/units and M1/M2 agree machine representation.
- [ ] Patient identity, time window, and missing-data rules are fixed.

## Phase 2: Choose One Canonical File

1. Document data/sample/demo_patient_001.json as the canonical combined fixture path. Canonical means this is the single source used to produce any needed copies.
2. Create sample/ and write data/README.md describing the format, provenance, synthetic status, owner, and planned importer.
3. Agree with M2 how Spring Boot finds the file locally and in Compose. Make the import path configurable; never depend on one developer's absolute Windows path inside a container.
4. Frontend should get data from Spring Boot. ML should get data in the backend request. Neither needs its own independently edited patient copy.
5. Use raw CSV files only when there is a real consumer. If created, document how they are derived from the canonical JSON.
6. Keep small fixtures in Git; keep runtime databases, caches, and large future generated datasets outside version control.

### Ask for Validation

M1 confirms the fixture can supply the screen and request fields. M2 checks the proposed local/container import path. M3 needs only the readable field table, not Docker configuration.

### Mark Phase 2 Done for Data When

- [ ] Canonical location, format, owner, and import plan are documented.
- [ ] M1/M2 agree how every consumer receives the same records.
- [ ] README explains what will be created and how it will be reviewed.

The fixture contents and real import are Phase 3 checks; do not claim they passed yet.

## Phase 3: Create, Validate, and Compare

1. M2 creates the agreed JSON with one EHR profile and ordered CGM history. Include enough points for a readable chart.
2. M3 reviews a simple table of the values, units, and timestamps. Record corrections in the canonical file, not only in the review table.
3. Check JSON parses. PowerShell's [ConvertFrom-Json](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/convertfrom-json) converts JSON text into objects; successful parsing alone does not prove clinical or schema validity.
4. Add backend validation tests for required fields, IDs, numeric values, units, unique reading timestamps, ordering, and observations not later than as-of.
5. Import into Spring Boot twice. Confirm the same patient/readings remain without duplicates.
6. M1 compares the API and chart with the canonical fixture. Check displayed units and timezone conversion explicitly.
7. Put deliberately invalid examples only in test fixtures, not alongside normal import data.
8. Record the reviewed revision, validation output, reviewer, and any limitations.

After the fixture exists, this is a syntax inspection from PowerShell:

~~~powershell
Set-Location 'D:\code\happyHealth\data'
Get-Content -LiteralPath '.\sample\demo_patient_001.json' -Raw | ConvertFrom-Json
~~~

For optional CSV, use [Import-Csv](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/import-csv) to inspect named columns; remember imported strings still need explicit type/unit validation.

### Ask for Validation

Ask M3 before accepting changed clinical values or units. Ask M1 to compare visible values after import. If the chart differs, send the specific JSON row, API value, and screenshot so the responsible transformation can be identified.

### Mark Phase 3 Done for Data When

- [ ] Canonical JSON parses and all agreed automated validation checks pass.
- [ ] Repeated import creates no duplicates.
- [ ] M3 records plausibility review; M1 confirms API/chart correspondence.
- [ ] Fixture provenance, revision, and limitations are recorded.

Mark the matching TODO items. This is integration-demo data, not a validated training cohort.

## Sources and How to Use Them

Official references checked for this guide on 2026-10-05.

| Source | Read for |
| --- | --- |
| [NIDDK: A1C](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test) | Field meaning; M3 adds relevant sources for clinical choices |
| [NIDDK: CGM](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring) | CGM terminology and context |
| [PowerShell JSON parsing](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/convertfrom-json) | Structural inspection |
| [PowerShell CSV import](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/import-csv) | Optional raw-file inspection |
| [Synthea](https://synthetichealth.github.io/synthea/) | Later synthetic-data generation; no setup required now |
