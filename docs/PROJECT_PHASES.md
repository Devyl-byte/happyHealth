# Project Phases

Status: planned. This document is the authoritative delivery sequence for happyHealth / GlucoTwin.
The initial five folders exist; service implementation and verification are still pending.
Checklist items must be marked complete only after their acceptance checks pass.

## Team and Ownership

| Member | Role | Responsibility |
| --- | --- | --- |
| M1 | Fullstack developer | Frontend, Python ML service implementation/coordination, frontend integration, demo experience |
| M2 | Java/Spring Boot + IoT + digital twin developer | Backend, persistence, MQTT broker, sensor publishers, ingestion, digital twin, Spring Boot-to-ML integration |
| M3 | BPharma / healthcare domain lead | Clinical scope, field definitions, synthetic-data plausibility, clinical wording, limitations, presentation content |

M1 owns ML coordination, not M2. M2 owns MQTT and digital twin together.
M3 supplies and reviews healthcare content; coding, automated validation, and infrastructure remain with M1/M2.
The intern is excluded from the delivery plan.

## Architecture and Working Agreements

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Axios, Lucide React.
- Backend: Java 21, Spring Boot 3, Maven, Spring Web, Validation, Spring Data JPA, H2, WebClient, Actuator.
- ML service: Python 3.11, FastAPI, Uvicorn, Pydantic initially; Pandas, NumPy, Scikit-learn, XGBoost, SHAP, Joblib for Phase 5.
- IoT from Phase 4: Eclipse Mosquitto, MQTT, Python Paho publisher, Spring Integration MQTT.
- Data: synthetic CSV and JSON initially; Parquet feature datasets in Phase 5.
- Tooling: Git/GitHub, Docker/Compose, npm, Maven, pip/virtualenv.
- Verification: JUnit 5, Mockito, MockMvc, Pytest, React Testing Library, end-to-end demo checks.
- Select and record compatible exact dependency patch versions and lock files during Phase 2.
- Keep the five top-level folders. Add nested source/test/config directories as needed; root configuration files are allowed.
- React calls Spring Boot only. Spring Boot calls FastAPI over internal HTTP.
- Treat a mock score as a fixed integration fixture, never as model output or clinical evidence.

## Phase Overview

| Phase | Outcome | Primary owners | Depends on |
| --- | --- | --- | --- |
| 1. Scope & Contracts | Agreed use case, schemas, contracts, acceptance criteria | All; M3 clinical, M1 ML contract, M2 backend contract | Existing planning documents |
| 2. Project Setup | Three runnable services, health checks, H2, local tooling | M1 + M2 | Phase 1 contracts |
| 3. First End-to-End Demo | One synthetic patient and mock prediction across all services | M1 + M2; M3 review | Phase 2 |
| 4. IoT & Digital Twin | Sensor events update patient twin and dashboard | M2; M1 UI support; M3 ranges | Phase 3, sensor contract |
| 5. ML Development & Validation | Reproducible evaluated model and explanations | M1; M3 review; M2 feature alignment | Phase 3 and agreed data contract |
| 6. Live Prediction Integration | Live twin features produce real model output in dashboard | M1 + M2 | Phases 4 and 5 |
| 7. Dashboard & Scenario Simulation | Complete doctor demo and exploratory scenarios | M1; M2 simulation; M3 review | Phase 6 |
| 8. Testing & Submission | Reproducible release and complete submission artifacts | All | Phase 7 |

Phases 4 and 5 can proceed in parallel once their shared feature contract is stable.
No calendar estimates are committed: confirm team availability and submission date before scheduling.

## Phase 1: Scope & Contracts

Tasks:
- M3 documents one condition (Type 2 Diabetes) and the two-hour prediction target.
- M3 reviews the blueprint's candidate event thresholds; record the final definition, source, date, and limitations. Probability risk bands and glucose event thresholds are different concepts.
- M1/M2 agree patient IDs, UTC timestamps, units, missing-value rules, API errors, and request/response examples.
- M2 drafts the future MQTT payload and twin state boundaries without building the pipeline.
- M1 drafts the dashboard view and Python ML contract; M3 reviews labels.
- All agree Phase 3's exact demo and exclusions.

Outputs: docs/API_CONTRACT.md, docs/DATA_DICTIONARY.md, docs/CLINICAL_SCOPE.md, docs/ARCHITECTURE.md, docs/ACCEPTANCE_CRITERIA.md.
Exit gate: all three review the relevant contracts; unresolved assumptions have named owners.

## Phase 2: Project Setup

Tasks:
- M2 scaffolds Java 21/Spring Boot 3 with H2, validation, Actuator, and a configured ML WebClient.
- M1 scaffolds React/TypeScript and FastAPI/Pydantic with clear package/environment setup.
- M2 leads root Docker Compose and .env.example; M1 supplies frontend/ML build configuration.
- M1/M2 add focused health/startup checks and document host versus container URLs.
- M1 leads root README and Git conventions; all record prerequisites and commands.

Outputs: runnable scaffolds, health endpoints, dependency manifests, root setup files, local run instructions.
Exit gate: frontend renders, backend and ML health checks pass, H2 initializes, and backend can reach ML health.
No trained model or MQTT dependency is required for startup.

## Phase 3: First End-to-End Demo

Tasks:
- M2 prepares and imports a small fixed synthetic patient fixture; M3 reviews field plausibility.
- M2 implements patient, EHR, sensor-history, and prediction orchestration endpoints.
- M1 implements a deterministic, schema-valid mock prediction endpoint in FastAPI.
- M1 renders patient summary, historical CGM chart, and a clearly labelled mock score/explanation.
- M1/M2 exercise the actual HTTP chain and failure states, then M3 reviews visible wording.

Outputs: one runnable patient journey, contract examples, focused tests, demo instructions and evidence.
Exit gate: React -> Spring Boot -> FastAPI -> Spring Boot -> React works with mock provenance intact.
Stopping ML must produce a visible unavailable state, not an invented score.
Excluded: training, SHAP computation, live MQTT, personalized twin dynamics, and what-if inference.

## Phase 4: IoT & Digital Twin

Tasks:
- M2 configures Mosquitto and a synthetic Python/Paho publisher.
- M2 validates event IDs, patient IDs, timestamps, units, duplicate events, and out-of-order readings.
- M2 persists sensor readings and combines static EHR with rolling signal state.
- M1 displays refreshed twin data; M3 reviews simulated ranges and missing/stale-data wording.
- M2 verifies broker reconnects and documents how synthetic devices map to future real integrations.

Exit gate: repeated sensor events update the right patient's twin, history, and freshness indicator without duplicate corruption.
Model responses may remain mocked until Phase 6.

## Phase 5: ML Development & Validation

Tasks:
- M1 builds reproducible synthetic training-data generation and feature processing.
- M3 reviews target definition and assumptions; M2 checks runtime feature availability.
- M1 separates feature history from future labels and splits evaluation by patient/time to prevent leakage.
- M1 trains a simple baseline and XGBoost; reports discrimination, precision/recall, calibration, and limitations.
- M1 adds SHAP explanations and exports Joblib artifacts, feature schema, model version, and metrics.
- All distinguish synthetic-data performance from evidence of real clinical utility.

Exit gate: repeatable training/evaluation commands, held-out results, loadable model, and model card.
Numerical performance targets are agreed before evaluation, not invented after seeing results.

## Phase 6: Live Prediction Integration

Tasks:
- M1 replaces mock inference with artifact-backed FastAPI inference.
- M2 maps the current twin into the agreed feature contract and handles latency/timeouts.
- M1/M2 preserve patient identity, prediction time, model version, freshness, and explanation provenance.
- M1 displays real versus mock mode explicitly; unavailable results never masquerade as valid scores.
- M1/M2 validate feature parity, stale inputs, service errors, and the complete live loop.

Exit gate: live synthetic sensor events drive an actual model prediction and explanation visible on the dashboard.

## Phase 7: Dashboard & Scenario Simulation

Tasks:
- M1 completes patient navigation, chart views, risk explanations, and responsive states.
- M2 owns scenario orchestration and keeps scenario changes separate from the persisted real twin.
- M1 coordinates model inputs for selected exploratory what-if scenarios.
- M3 reviews wording and ensures simulated associations are not presented as proven treatment effects.
- All rehearse the intended doctor-facing workflow.

Exit gate: baseline and scenario results are distinguishable; cancelling a scenario leaves the patient's actual state unchanged.

## Phase 8: Testing & Submission

Tasks:
- M1/M2 verify the full workflow, reconnects, invalid inputs, service failures, and clean startup.
- M3 finalizes healthcare relevance, limitations, and clinical language.
- All finish README, license, team details, architecture PDF/PPT, model card, and presentation PDF/PPT.
- Record the required minimum 20-minute demo video and verify accessible submission links.
- Recheck the challenge brief before submission; record release revision and reproducible run commands.

Exit gate: a fresh checkout can reproduce the demo and the submission checklist is complete.

## Phase 3 Demonstration Checklist

- [ ] Documented prerequisites and commands work from a clean environment.
- [ ] Health checks pass for backend and ML; frontend loads.
- [ ] A synthetic patient is loaded once and remains identifiable across services.
- [ ] Dashboard shows patient summary and time-stamped CGM history with units.
- [ ] Refresh invokes Spring Boot, which invokes FastAPI's mock endpoint.
- [ ] Dashboard displays mock score, time horizon, timestamp, and explicitly mock explanation.
- [ ] Unknown patient and unavailable ML produce documented, understandable errors.
- [ ] Browser network requests contain no direct ML or MQTT calls.
- [ ] Focused tests pass and evidence is recorded in docs/PHASE_STATUS.md.
- [ ] M3 reviews labels and limitations before marking Phase 3 complete.

## Folder Task Lists

- [Backend TODO](../backend/TODO.md)
- [Frontend TODO](../frontend/TODO.md)
- [ML Service TODO](../ml-service/TODO.md)
- [Data TODO](../data/TODO.md)
- [Documentation TODO](TODO.md)

These task lists cover Phases 1-3 only. They are plans, not claims that implementation exists.

Each initial folder also has a HOW_TO.md with practical steps, official sources, tools, review handoffs, and phase completion checks. Start with the [coordination guide](HOW_TO.md) for the guide index and shared review-record template.
