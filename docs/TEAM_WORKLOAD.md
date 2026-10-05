# Team Workload and Responsibilities

This workload plan is designed for 3 official team members. The intern is not counted in this responsibility matrix.

## Team Structure

1. Fullstack Developer
2. Java/Spring Boot + IoT + Digital Twin Developer
3. BPharma / Healthcare Domain Lead

## 1. Fullstack Developer

### Primary Ownership

- Doctor-facing dashboard
- Frontend user experience
- Frontend integration with Spring Boot APIs
- Python ML service coordination
- Demo flow and visual polish

### Responsibilities

- Build the React + TypeScript dashboard interface for doctors.
- Create the patient overview screen with demographics, condition summary, and current risk level.
- Build charts for CGM, heart rate, sleep, steps, and predicted glucose risk using Recharts.
- Create UI sections for:
  - Patient profile
  - Digital twin timeline
  - Glucose spike prediction
  - Risk explanation
  - Scenario simulation
  - Clinical summary
- Connect frontend screens to Spring Boot backend APIs.
- Coordinate the Python ML service for prediction and explainability endpoints.
- Define the request and response format between Spring Boot and the Python ML service with the backend owner.
- Support Python ML service setup, mocked prediction responses, and final model API integration.
- Maintain the ML service API documentation so frontend and backend expectations stay aligned.
- Define frontend API client files for patients, predictions, digital twin state, and simulation.
- Handle loading states, empty states, and error states.
- Make the dashboard presentable for jury demo and video recording.
- Prepare dashboard screenshots for README, presentation, and architecture explanation.
- Support final README polishing and demo script writing.

### Expected Deliverables

- Working React frontend application.
- Doctor dashboard screens.
- API-integrated patient and prediction views.
- Python ML service API contract and coordination notes.
- Dashboard charts and risk display.
- Demo-ready UI flow.

## 2. Java/Spring Boot + IoT + Digital Twin Developer

### Primary Ownership

- Spring Boot backend API
- MQTT broker and IoT data flow
- Digital twin logic
- Data ingestion and backend integration

### Responsibilities

- Set up the main backend service using Java 21 and Spring Boot 3.
- Create Spring Boot API endpoints for:
  - Patient list
  - Patient profile
  - EHR data
  - Wearable/CGM time-series data
  - Prediction result
  - Risk explanation
  - Digital twin state
  - Scenario simulation
- Create Spring Boot services for loading and processing synthetic EHR and wearable datasets.
- Connect Spring Boot to the Python ML service using WebClient based on the API contract coordinated by the fullstack developer.
- Return prediction output in a frontend-friendly format.
- Handle backend validation, error responses, and API documentation.
- Set up H2 database or local storage for prototype patient and sensor data.
- Write basic backend tests for core endpoints.
- Own the focused digital twin design for Type 2 Diabetes glucose spike prediction.
- Define how each virtual patient is represented as a digital twin.
- Design the data flow from wearable/IoT signals into the system.
- Set up or simulate an Eclipse Mosquitto MQTT broker for streaming sensor-like data.
- Create MQTT topics for signals such as:
  - CGM glucose readings
  - Heart rate
  - Step count
  - Sleep score
  - Meal event
  - Stress proxy
- Build or support Python scripts that publish synthetic sensor data to MQTT topics.
- Build Spring Boot MQTT ingestion that reads sensor events and stores or forwards them.
- Define realistic ranges and update frequency for simulated IoT streams.
- Ensure streamed data can be converted into ML features.
- Explain how the prototype could connect to real devices such as CGM sensors, smartwatches, or fitness bands in the future.
- Document the backend API, digital twin architecture, and MQTT data pipeline.

### Expected Deliverables

- Working Spring Boot backend API.
- Spring Boot connection to Python ML service using the agreed API contract.
- Prediction API connected to model output.
- Clean API contracts for frontend integration.
- Backend setup and run instructions.
- Digital twin design document or section.
- MQTT broker setup or simulation.
- Synthetic IoT publisher script.
- Sensor topic structure.
- Real-time data-flow explanation.
- Backend tests for core API behavior.

## 3. BPharma / Healthcare Domain Lead

### Primary Ownership

- Healthcare use case
- Medical relevance
- Clinical language and ethics
- Presentation story
- Submission documentation from the healthcare perspective

### Responsibilities

- Validate the chosen problem statement: Type 2 Diabetes glucose spike prediction.
- Define medically meaningful thresholds for glucose spike risk.
- Help classify risk into low, moderate, high, and critical categories.
- Review patient profile fields and ensure they make sense clinically.
- Review dashboard labels, warnings, and summary text for medical clarity.
- Write or support documentation for:
  - Healthcare problem statement
  - Clinical need
  - Patient safety
  - Limitations
  - Ethical use
  - Privacy considerations
  - Healthcare impact
- Ensure the project avoids unsupported diagnosis or treatment claims.
- Prepare the healthcare impact section for README and presentation.
- Help create the model card from a clinical safety and limitation perspective.
- Support the data dictionary by explaining clinical fields such as HbA1c, fasting glucose, BMI, sleep, activity, and glucose threshold values.
- Support the demo script by explaining why this solution matters for doctors and patients.
- Lead the presentation sections about public health relevance, doctor workflow, and patient safety.

### Expected Deliverables

- Healthcare use-case writeup.
- Clinical threshold notes.
- Ethics and privacy section.
- Healthcare impact section for README and slides.
- Medical review of UI wording and dashboard alerts.
- Presentation content for clinical relevance and safety.

## Shared Team Responsibilities

- Keep the GitHub repository organized and public for submission.
- Use only synthetic, anonymized, or open-source data.
- Maintain clear setup instructions.
- Keep documentation updated as the build evolves.
- Prepare the architecture diagram.
- Prepare the final presentation in PDF/PPT format.
- Record a minimum 20-minute demo video.
- Ensure the prototype can be run and demonstrated smoothly.

## Suggested Work Distribution by Phase

The authoritative eight-phase sequence and exit gates are in [PROJECT_PHASES.md](PROJECT_PHASES.md).

| Phase | Fullstack Developer | Backend / IoT / Digital Twin Developer | BPharma Lead |
| --- | --- | --- | --- |
| 1. Scope & Contracts | Dashboard requirements and ML contract | Backend/data contracts and future MQTT design | Clinical target, fields, and wording |
| 2. Project Setup | React and FastAPI setup | Spring Boot, H2, and Compose coordination | Review documentation and terminology |
| 3. First End-to-End Demo | Dashboard and deterministic ML mock | Synthetic fixture import and API orchestration | Review fixture plausibility and demo wording |
| 4. IoT & Digital Twin | Display refreshed twin state | Mosquitto, publishers, ingestion, and twin updates | Review sensor ranges and freshness wording |
| 5. ML Development & Validation | ML implementation/coordination and evaluation | Runtime feature alignment | Review target and data assumptions |
| 6. Live Prediction Integration | Actual inference and frontend results | Twin-to-ML mapping and failure handling | Review output interpretation |
| 7. Dashboard & Scenario Simulation | Complete dashboard and ML scenario coordination | Scenario orchestration | Review scenario claims and clinical text |
| 8. Testing & Submission | Frontend tests, screenshots, and demo | Backend/IoT tests and reproducible startup | Clinical narrative, limitations, and presentation |

Detailed Phase 1-3 tasks are in each of the five folders' TODO.md files. ML coordination remains with the fullstack developer; MQTT and digital twin remain together with the backend developer.

