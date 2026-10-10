# Engineering Status

The challenge's “Phase 1” is the complete prototype submission. The stages below
are internal engineering checkpoints only.

| Internal stage | Status | Evidence or next gate |
| --- | --- | --- |
| Scope and contracts | Ready for review | API, data, architecture, acceptance, and safety documents exist; clinical review pending |
| Project setup | Implemented, Docker run pending | Five-service Compose contract, health checks, isolated build contexts, and local run paths exist; clean-computer startup remains intentionally unverified |
| Synthetic end-to-end demo | Implemented and component-tested | Canonical fictional patient drives the API and dashboard; full Compose startup remains pending |
| Simulated stream and digital twin | Implemented and component-tested | MQTT publisher, ordered/idempotent ingestion, explicit accelerated time, H2 state, and backend tests exist |
| ML development | Ready for review | Reproducible Logistic Regression baseline; clinical target review pending |
| Live prediction integration | Implemented and component-tested | FastAPI verifies the versioned 43-feature artifact and checksum; Spring Boot validates model responses and exposes unavailable states |
| Dashboard | Implemented and component-tested | Responsive doctor view, timeline, uncalibrated score, model factors, simulation label, stale state, and failures are implemented |
| Submission package | In progress | Licence, architecture, and presentation files are ready; team details, clinical review, video, and clean-computer Docker check remain |

## Review record

| Review | Owner | Date | Status | Notes |
| --- | --- | --- | --- | --- |
| Clinical target and wording | Healthcare-domain lead | — | Pending | Record reviewer name and corrections |
| API and feature availability | Fullstack + backend owners | 2026-10-10 | Verified outside Docker | Automated Python, Java, and React tests; full Compose run excluded from this remediation pass |
| Submission compliance | Team leader | — | Pending | Confirm team details, public access, folder name, and links |
