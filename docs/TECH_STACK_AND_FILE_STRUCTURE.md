# Tech Stack and File Structure

## 1. Exact Tools and Technologies

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts for dashboard charts
- Axios for API calls
- Lucide React for icons

### Main Backend API

- Java 21
- Spring Boot 3
- Spring Web for REST APIs
- Spring Validation for request validation
- Spring Data JPA for persistence
- H2 Database for local prototype storage
- Maven for dependency management and builds
- WebClient for calling the Python ML service
- Spring Boot Actuator for health checks

### Python ML Service

- Python 3.11
- FastAPI for the internal ML inference API
- Uvicorn for running the ML service
- Pydantic for ML request/response validation
- Pandas for feature processing
- NumPy for numerical processing
- Scikit-learn for baseline models and metrics
- XGBoost for glucose spike prediction
- SHAP for model explainability
- Joblib for saving/loading trained model files

### IoT and Digital Twin Layer

- Eclipse Mosquitto MQTT Broker
- MQTT protocol
- Python Paho MQTT client for sensor publishers
- Spring Integration MQTT or Eclipse Paho Java client for backend MQTT ingestion
- Synthetic IoT publisher scripts
- MQTT topics for CGM, heart rate, steps, sleep, meal events, and stress proxy

### Data and Storage

- CSV for raw synthetic data
- Parquet for processed feature datasets
- H2 Database for local Spring Boot prototype persistence
- JSON for demo patient payloads
- Joblib for ML model artifacts

### Documentation and Submission

- Markdown for docs
- Mermaid for architecture diagrams inside Markdown
- PowerPoint or Google Slides for final presentation
- PDF export for final architecture and presentation files

### Testing

- JUnit 5 for Spring Boot tests
- Mockito for Java unit tests
- MockMvc for Spring API tests
- Pytest for Python ML service tests
- React Testing Library for frontend component tests
- Manual demo testing for end-to-end flow

### DevOps and Project Tools

- Git
- GitHub public repository
- Docker
- Docker Compose
- npm for frontend package management
- Maven for Java backend builds
- pip / virtualenv for Python ML environment

## 2. Final Repository Structure

```text
happyHealth/
  README.md
  LICENSE
  .gitignore
  docker-compose.yml
  .env.example

  docs/
    PROJECT_BLUEPRINT.md
    TEAM_WORKLOAD.md
    TECH_STACK_AND_FILE_STRUCTURE.md
    ARCHITECTURE.md
    DATA_DICTIONARY.md
    MODEL_CARD.md
    DEMO_SCRIPT.md
    SUBMISSION_CHECKLIST.md

  data/
    raw/
      ehr_patients.csv
      wearable_events.csv
      cgm_readings.csv
    processed/
      patient_features.parquet
      model_training_dataset.parquet
    sample/
      demo_patient_001.json
      demo_patient_002.json

  notebooks/
    01_synthetic_data_exploration.ipynb
    02_feature_engineering.ipynb
    03_model_training_and_evaluation.ipynb

  scripts/
    generate_synthetic_ehr.py
    generate_synthetic_wearables.py
    generate_training_dataset.py
    train_model.py
    evaluate_model.py
    mqtt_publish_sensors.py
    mqtt_consume_sensors.py

  backend/
    pom.xml
    src/
      main/
        java/
          com/
            happyhealth/
              HappyHealthApplication.java

              config/
                CorsConfig.java
                WebClientConfig.java
                MqttConfig.java

              controller/
                PatientController.java
                PredictionController.java
                DigitalTwinController.java
                SimulationController.java

              dto/
                PatientDto.java
                EhrDto.java
                SensorReadingDto.java
                PredictionRequest.java
                PredictionResponse.java
                SimulationRequest.java
                SimulationResponse.java

              entity/
                Patient.java
                EhrProfile.java
                SensorReading.java
                DigitalTwinState.java

              repository/
                PatientRepository.java
                EhrProfileRepository.java
                SensorReadingRepository.java
                DigitalTwinStateRepository.java

              service/
                PatientService.java
                PredictionService.java
                DigitalTwinService.java
                SimulationService.java
                MqttIngestionService.java

              client/
                MlServiceClient.java

              mapper/
                PatientMapper.java
                SensorReadingMapper.java

        resources/
          application.yml
          data.sql
      test/
        java/
          com/
            happyhealth/
              controller/
                PatientControllerTest.java
                PredictionControllerTest.java
              service/
                PredictionServiceTest.java

  ml-service/
    requirements.txt
    pyproject.toml
    app/
      __init__.py
      main.py
      config.py

      api/
        __init__.py
        routes_health.py
        routes_predict.py
        routes_explain.py

      schemas/
        __init__.py
        prediction.py
        explanation.py

      services/
        __init__.py
        feature_service.py
        prediction_service.py
        explanation_service.py

      ml/
        __init__.py
        model_loader.py
        feature_builder.py
        risk_bands.py
        artifacts/
          glucose_spike_xgboost.joblib
          feature_columns.json
          model_metrics.json

    tests/
      test_predict_api.py
      test_feature_builder.py
      test_risk_bands.py

  frontend/
    package.json
    vite.config.ts
    tsconfig.json
    tailwind.config.js
    postcss.config.js
    index.html

    src/
      main.tsx
      App.tsx
      styles.css

      api/
        client.ts
        patients.ts
        predictions.ts
        digitalTwin.ts
        simulation.ts

      components/
        layout/
          AppShell.tsx
          Sidebar.tsx
          Header.tsx

        dashboard/
          PatientSummary.tsx
          RiskScoreCard.tsx
          GlucoseTrendChart.tsx
          WearableSignalsChart.tsx
          RiskExplanationPanel.tsx
          ScenarioSimulator.tsx
          ClinicalSummary.tsx

        common/
          Button.tsx
          Card.tsx
          Badge.tsx
          LoadingState.tsx
          ErrorState.tsx

      pages/
        DashboardPage.tsx
        PatientDetailPage.tsx

      types/
        patient.ts
        prediction.ts
        sensor.ts
        simulation.ts

      utils/
        formatters.ts
        riskColors.ts
```

## 3. Folder Responsibilities

### `docs/`

Stores all submission and project documentation.

- `PROJECT_BLUEPRINT.md`: main idea, scope, ML plan, dashboard plan.
- `TEAM_WORKLOAD.md`: 3-member responsibility split.
- `PROJECT_PHASES.md`: authoritative eight-phase roadmap and exit gates.
- `TODO.md`: detailed documentation tasks through Phase 3; each other initial folder also has its own TODO.md.
- `TECH_STACK_AND_FILE_STRUCTURE.md`: exact tools and folder structure.
- `ARCHITECTURE.md`: system architecture and data-flow diagram.
- `DATA_DICTIONARY.md`: explanation of each dataset field.
- `MODEL_CARD.md`: model purpose, metrics, limitations, and ethical notes.
- `DEMO_SCRIPT.md`: 20-minute demo video script.
- `SUBMISSION_CHECKLIST.md`: final hackathon submission checklist.

### `data/`

Stores synthetic and processed data only. No real patient data should be placed here.

- `raw/`: generated synthetic EHR, CGM, wearable, and event data.
- `processed/`: cleaned features used for model training.
- `sample/`: small demo patient files used by frontend/backend demos.

### `notebooks/`

Used for exploration, feature engineering, model training, and evaluation explanation.

### `scripts/`

Command-line scripts for repeatable project tasks.

- Data generation
- Feature dataset creation
- Model training
- Model evaluation
- MQTT publishing and consuming

### `backend/`

Spring Boot backend that owns the main product API. It serves patient data, digital twin state, simulation endpoints, and frontend-facing prediction APIs. It calls the Python ML service internally when model inference or explanation is needed.

### `ml-service/`

Python FastAPI service that owns ML inference and explainability. It loads model artifacts, builds ML features, returns glucose spike risk, and returns explanation values for the dashboard.

### `frontend/`

React dashboard used by doctors to view patient risk, sensor trends, prediction explanation, and intervention scenarios.

## 4. Service Communication

```text
React Frontend
      |
      v
Spring Boot Backend API
      |
      | internal HTTP call
      v
Python ML Service
      |
      v
XGBoost model + SHAP explanation
```

The frontend should call only the Spring Boot backend. The Python ML service should remain internal and should not be called directly from the frontend.

## 5. Spring Boot API Plan

### Patient APIs

- `GET /api/patients`
- `GET /api/patients/{patientId}`
- `GET /api/patients/{patientId}/ehr`
- `GET /api/patients/{patientId}/sensors`

### Prediction APIs

- `GET /api/predictions/{patientId}/current`
- `POST /api/predictions/{patientId}/refresh`
- `GET /api/predictions/{patientId}/explanation`

### Digital Twin APIs

- `GET /api/digital-twin/{patientId}`
- `GET /api/digital-twin/{patientId}/timeline`
- `POST /api/digital-twin/{patientId}/update`

### Scenario Simulation APIs

- `POST /api/simulation/{patientId}/walk-after-meal`
- `POST /api/simulation/{patientId}/reduced-carb-meal`
- `POST /api/simulation/{patientId}/custom`

## 6. Python ML Service API Plan

These endpoints are internal and called by Spring Boot.

- `GET /health`
- `POST /ml/predict-glucose-spike`
- `POST /ml/explain-glucose-spike`

Example ML prediction response:

```json
{
  "patient_id": "P001",
  "risk_probability": 0.78,
  "risk_band": "high",
  "prediction_window_minutes": 120,
  "top_factors": [
    "high current glucose",
    "rapid 30-minute glucose slope",
    "low steps after meal"
  ]
}
```

## 7. MQTT Topic Structure

Use the following topic format:

```text
happyhealth/patients/{patient_id}/cgm
happyhealth/patients/{patient_id}/heart-rate
happyhealth/patients/{patient_id}/steps
happyhealth/patients/{patient_id}/sleep
happyhealth/patients/{patient_id}/meal
happyhealth/patients/{patient_id}/stress
```

Example MQTT payload:

```json
{
  "patient_id": "P001",
  "timestamp": "2026-10-05T10:30:00+05:30",
  "signal": "cgm",
  "value": 156,
  "unit": "mg/dL"
}
```

## 8. Model Artifact Structure

```text
ml-service/
  app/
    ml/
      artifacts/
        glucose_spike_xgboost.joblib
        feature_columns.json
        model_metrics.json
```

The Python ML service loads these artifacts at startup and uses them for prediction and explanation.

## 9. Recommended Build Order

Follow [PROJECT_PHASES.md](PROJECT_PHASES.md) and the TODO.md in each initial folder.

1. Agree scope, schemas, and contracts.
2. Set up the three services, H2, root configuration, and health checks.
3. Deliver one synthetic patient and a labelled mock prediction through React -> Spring Boot -> FastAPI -> Spring Boot -> React.
4. Add MQTT ingestion and digital twin updates.
5. Develop and evaluate the actual ML model; this can run alongside Phase 4 after contracts are stable.
6. Integrate actual inference with live twin features.
7. Complete the dashboard and exploratory scenarios.
8. Verify reproducibility and finalize submission artifacts.

The expanded repository tree above is a future structure, not a requirement to create every file before Phase 3. Start with docs/, backend/, frontend/, ml-service/, and data/.

