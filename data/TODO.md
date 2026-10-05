# Data TODO: Phases 1-3

Technical owner: M2 for Phase 3 patient/history fixtures and import.
ML consumer/coordinator: M1; clinical definitions and plausibility review: M3.
Roadmap: [Project phases](../docs/PROJECT_PHASES.md).
Status: planning checklist; all fixture and validation tasks are pending.

Practical companion: [HOW_TO.md](HOW_TO.md) explains the steps, tools, sources, review handoffs, and when each phase can be marked done.

## Phase 1: Define the Minimum Dataset

- [ ] Agree one synthetic demo patient with stable ID P001; use the same ID in EHR, CGM, APIs, and prediction responses.
- [ ] Select only fields needed by Phase 3, for example age, diabetes duration, BMI, HbA1c, diagnosis, and medication class.
- [ ] M3 defines field meaning and units in docs/DATA_DICTIONARY.md; M2 defines type, required status, and machine validation.
- [ ] Define CGM rows with patient_id, timestamp, glucose value, and mg/dL unit.
- [ ] Choose and document a fixed historical window and sampling interval for the demo.
- [ ] Define UTC ISO-8601 timestamps and a fixed snapshot/as-of time; avoid ambiguous local times.
- [ ] Mark the data as synthetic and choose clearly fictional identifiers without personal contact details.
- [ ] Agree missing-value rules: absent measurement is not zero, and implausible values are not silently corrected.
- [ ] Distinguish historical input measurements from future outcome labels; Phase 3 needs no training labels.
- [ ] M3 reviews candidate values against the intended clinical scenario and records assumptions, without claiming real-world validation.

Acceptance: the data dictionary lets M2 create/import fixtures and M1 interpret every visible field.

## Phase 2: Organize and Document

- [ ] Create sample/ and raw/ when fixtures are added; reserve processed/ for later derived data.
- [ ] Write data/README.md explaining file formats, units, provenance, synthetic status, and reset/reuse instructions.
- [ ] Define data/sample/demo_patient_001.json as the canonical combined Phase 3 fixture.
- [ ] Agree whether raw/ehr_patients.csv and raw/cgm_readings.csv are needed; create them only if consumed, and derive them from the same canonical fixture.
- [ ] Document which component loads the fixture: Spring Boot imports it; frontend receives it via APIs; ML receives it via Spring Boot.
- [ ] M2 records import/mount paths that work both natively and in Docker Compose.
- [ ] Agree version control rules: commit small reviewable fixtures, ignore large generated datasets and runtime databases.
- [ ] Plan automated validation in the backend test suite; do not introduce a sixth top-level folder for a one-patient fixture.

Acceptance: one documented fixture location and one agreed import path exist, with no contradictory copies.

## Phase 3: Build and Review the Demo Fixture

- [ ] M2 creates the canonical JSON fixture with one patient, EHR, and enough ordered CGM readings to show a visible trend.
- [ ] M3 reviews values, field units, and the narrative for plausibility; record the review in docs/PHASE_STATUS.md.
- [ ] M2 validates parseability, required fields, numeric values, timestamps, and matching patient IDs.
- [ ] Check reading timestamps are unique within the patient/signal and chronologically ordered for the demo.
- [ ] Check no reading is after the fixture's as-of timestamp; document the difference between historical observation time and prediction generation time.
- [ ] Confirm the importer is repeatable and does not duplicate patients/readings on restart.
- [ ] M1 checks every displayed chart value corresponds to the fixture returned by Spring Boot.
- [ ] Keep fixed mock prediction probability and mock explanation in the ML mock code/contract, not in the dataset as measured truth.
- [ ] Store malformed/missing-data test cases in the owning service's test fixtures so they cannot be imported as normal demo data.
- [ ] Document any derived CSV/JSON copies and how they remain synchronized.
- [ ] Record exact fixture revision and demo limitations alongside the Phase 3 verification.

Planned files: data/README.md, sample/demo_patient_001.json, and optional consumed raw CSV files.
Dependencies: clinical field review and API/data contracts.
Handoff: validated fixture and import instructions to backend/; field interpretation to frontend/ and ml-service/.

## Deferred

Large synthetic cohorts, wearable streaming, training labels, Parquet features, cohort distributions, and train/validation/test splits.
These belong to Phases 4-5 after the first integration demo.
