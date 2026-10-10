# HappyHealth Virtual Patient Model

> A research-only digital twin prototype that fuses a synthetic health record
> with simulated continuous glucose data to forecast a post-meal glucose spike
> two hours in advance.

**Challenge status:** working vertical slice. **Data shown in the public demo is
fully synthetic.** This prototype is not clinically validated and must not be used
for diagnosis, treatment, insulin dosing, or emergencies.

## Team details

Complete these fields before submission:

| Required item | Value |
| --- | --- |
| Team name | **TODO — team leader to provide** |
| College / incubator | **TODO — team leader to provide** |
| Team leader | **TODO — team leader to provide** |
| Contact email and phone | Submit on the challenge platform; do not publish private contact details unless required |
| 20+ minute demo video | **TODO — add unlisted video link** |

## Problem and healthcare use case

People with type 2 diabetes produce two very different forms of information:
slow-changing health-record facts such as age, BMI, HbA1c, diagnoses, and medication,
and fast-changing wearable readings such as glucose. Looking at only one stream loses
context. This prototype creates one **virtual patient** by joining both streams. Its
research event occurs when, within two hours after a meal, glucose either reaches
**180 mg/dL** or rises by at least **40 mg/dL** above the meal-time baseline. A
doctor-facing dashboard shows the timeline, an uncalibrated model score, and the
features that most influenced it.

## Working demonstration

```text
Synthetic EHR ───────────┐
                         ├─ Spring Boot digital twin ─ FastAPI model
Simulated CGM ─ MQTT ────┘              │                 │
                                        └──── React doctor dashboard
```

The public demo uses one canonical patient, `DEMO-001`. Spring Boot stores the
static profile and ordered sensor timeline in H2. The simulator publishes a new
CGM reading through MQTT every five seconds. Each five-second interval represents 15
minutes on an explicitly labelled accelerated simulation clock. The meal description
is a repeated scenario template applied at each prediction time, not a recorded meal
from a real person. Spring Boot builds the 43-feature model request and calls FastAPI.
React reads only the combined Spring Boot view.

Detailed diagrams and contracts:

- [Architecture](docs/ARCHITECTURE.md)
- [Architecture diagram (PowerPoint)](submission/TEAM_NAME_COLLEGE_NAME/happyhealth_architecture_diagram_v7.pptx)
- [Architecture diagram (PDF)](submission/TEAM_NAME_COLLEGE_NAME/happyhealth_architecture_diagram_v7.pdf)
- [Project presentation (PowerPoint)](submission/TEAM_NAME_COLLEGE_NAME/happyhealth_virtual_patient_presentation_v7.pptx)
- [Project presentation (PDF)](submission/TEAM_NAME_COLLEGE_NAME/happyhealth_virtual_patient_presentation_v7.pdf)
- [API contract](docs/API_CONTRACT.md)
- [Data dictionary](docs/DATA_DICTIONARY.md)
- [Clinical scope and safety](docs/CLINICAL_SCOPE.md)
- [Model card](ml-service/MODEL_CARD.md)
- [Remediation and honesty audit](docs/REMEDIATION_AUDIT.md)

## Run the complete prototype

1. Start Docker Desktop and wait until its engine reports that it is running.
2. From the repository root, run:

   ```powershell
   docker compose up --build
   ```

3. Open <http://localhost:3000>.
4. Select **Refresh prediction**. Watch the chart update as the synthetic publisher
   sends CGM readings.
5. Stop everything with `Ctrl+C`, then run `docker compose down`.

The supporting Spring Boot health endpoint is
<http://localhost:8080/actuator/health>. FastAPI and MQTT remain inside the Compose
network and are not published to the host.

## Run without Docker

Open three PowerShell terminals in the repository root.

```powershell
# Terminal 1: prediction service
.\.venv\Scripts\python.exe -m pip install -r ml-service\requirements.txt
$env:PYTHONPATH='ml-service'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
```

```powershell
# Terminal 2: digital twin coordinator
Set-Location backend
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 3: doctor dashboard
Set-Location frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. MQTT is optional in this mode; the seeded fixture
already contains nine CGM readings.

## Technical stack

| Layer | Technology | Job |
| --- | --- | --- |
| Dashboard | React 18, TypeScript, Vite, Recharts | Doctor interaction and glucose timeline |
| Digital twin | Java 21, Spring Boot, H2 | Merge EHR and CGM, enforce ordering/idempotency, coordinate prediction |
| Model API | Python 3.14, FastAPI, scikit-learn | Build live features and return an uncalibrated score |
| Streaming | MQTT, Eclipse Mosquitto, Python publisher | Simulate a real-time wearable/IoT feed |
| Runtime | Docker Compose, Nginx | Reproducible five-service demo |

## Model and evidence

The baseline is Logistic Regression with median imputation, missingness indicators,
and standardized features. It was evaluated with patient-level splits on the open
ShanghaiT2DM dataset. Validation ROC AUC is **0.701** and test ROC AUC is **0.757**;
these numbers show prototype ranking ability only, not clinical readiness. At the
fixed 0.5 evaluation threshold, Logistic Regression F1 is **0.779** on validation and
**0.742** on test, compared with **0.824** and **0.757** for an always-positive
majority baseline. The displayed score is not calibrated as a patient-specific
probability. Raw source data and patient-level prepared files are deliberately
excluded from Git and from Docker build contexts.

## Verification

```powershell
# Data pipeline, repository consistency, Python service, and schema parity
$env:PYTHONPATH='.;ml-service'
.\.venv\Scripts\python.exe -m pytest tests ml-service\tests -q

# Java digital twin
Set-Location backend
.\mvnw.cmd test

# React dashboard
Set-Location ..\frontend
npm test
npm run build
npm audit --audit-level=moderate
```

The same checks run in GitHub Actions on branch pushes and pull requests. `npm audit`
and `pip-audit` cover the declared JavaScript and Python dependencies; these checks
do not establish complete application or container security.

## Repository map

```text
backend/          Spring Boot digital twin and MQTT subscriber
frontend/         Doctor-facing React dashboard
ml-service/       FastAPI inference service and versioned model artifact
simulator/        Synthetic CGM MQTT publisher
data/sample/      Canonical synthetic demo patient
scripts/          Reproducible dataset preparation, features, and training
docs/             Contracts, scope, data guide, architecture, and status
submission/       Challenge handoff artifacts and checklist
```

## Submission checklist

- [x] Public-source/synthetic data only in the shareable prototype
- [x] Static EHR + dynamic wearable stream fusion
- [x] Working research event-scoring algorithm with explicit limitations
- [x] Conceptual doctor dashboard
- [x] Technical stack, model documentation, architecture source, and MIT license
- [x] Architecture diagram exported to PDF and PowerPoint
- [x] Project presentation exported to PDF and PowerPoint
- [ ] Team and college/incubator details supplied by team leader
- [ ] Minimum 20-minute demonstration video linked
- [ ] Clinical wording reviewed by the BPharma/healthcare reviewer

See [submission checklist](submission/SUBMISSION_CHECKLIST.md) for the final handoff.

## License and data terms

Project code is available under the [MIT License](LICENSE). Dataset licences and
source-specific terms remain separate; see the
[dataset licence notes](data/external/README.md).
