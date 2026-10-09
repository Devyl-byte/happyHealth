# API Contract (Phase 1 Draft)

Status: **DRAFT for review.** Owner: M2 (public routes). M1 owns section 6 (internal ML route). M3 reviews field meanings.
Scope: Phase 3 static patient snapshot with historical readings. This is not a live personalized digital twin.

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL (local) | `http://localhost:8080` |
| Format | JSON, `Content-Type: application/json`, UTF-8 |
| Patient ID | Stable synthetic ID, `P001` for the demo patient. Used identically in every route, record and ML request. |
| Timestamps | UTC ISO-8601 with `Z` suffix, e.g. `2026-10-09T08:00:00Z`. No local times. |
| Glucose unit | `mg/dL`, always stated in a `unit` field on readings. |
| Missing values | `null` or field absent. **Never `0`** for a missing measurement. |
| Field naming | `snake_case` in all JSON, public and internal. |
| Ordering | Sensor readings are ordered ascending by `timestamp`. |
| Errors | One envelope (section 2). No Java stack traces, class names or SQL ever appear in responses. |

## 2. Standard Error Envelope

Every non-2xx response from the public API uses this body:

```json
{
  "code": "PATIENT_NOT_FOUND",
  "message": "No patient exists with id 'P999'.",
  "timestamp": "2026-10-09T08:15:00Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `code` | string | Stable machine-readable code. Frontend branches on this, not on `message`. |
| `message` | string | Human-readable, safe to display. |
| `timestamp` | string | UTC time the error was generated. |

Error codes used in Phase 3:

| HTTP | `code` | When |
|---|---|---|
| 400 | `INVALID_REQUEST` | Malformed path variable, body or query. |
| 404 | `PATIENT_NOT_FOUND` | Unknown `patientId`. |
| 502 | `ML_BAD_RESPONSE` | ML service replied, but the payload failed validation (wrong `patient_id`, probability outside 0..1, missing fields). |
| 503 | `ML_SERVICE_UNAVAILABLE` | ML service unreachable or timed out. |
| 500 | `INTERNAL_ERROR` | Anything unexpected. Generic message only. |

## 3. Patient Routes

### 3.1 `GET /api/patients`

Returns patient summaries. Returns `200` with an empty array when none exist, never `404`.

Response `200`:

```json
[
  {
    "patient_id": "P001",
    "display_name": "Synthetic Patient 001",
    "age": 54,
    "sex": "F",
    "diabetes_type": "T2D"
  }
]
```

Empty state, `200`:

```json
[]
```

### 3.2 `GET /api/patients/{patientId}`

Response `200`:

```json
{
  "patient_id": "P001",
  "display_name": "Synthetic Patient 001",
  "age": 54,
  "sex": "F",
  "diabetes_type": "T2D",
  "snapshot_as_of": "2026-10-09T08:00:00Z"
}
```

Response `404`:

```json
{
  "code": "PATIENT_NOT_FOUND",
  "message": "No patient exists with id 'P999'.",
  "timestamp": "2026-10-09T08:15:00Z"
}
```

### 3.3 `GET /api/patients/{patientId}/ehr`

Synthetic EHR profile. Field list is a **proposal pending M3 review** (section 8).

Response `200`:

```json
{
  "patient_id": "P001",
  "hba1c_percent": 8.1,
  "bmi": 29.4,
  "fasting_glucose_mg_dl": 142,
  "years_since_diagnosis": 6,
  "medications": ["metformin"],
  "comorbidities": ["hypertension"],
  "recorded_at": "2026-10-01T00:00:00Z"
}
```

Nullability: `patient_id` is required. Clinical values may be `null` when unknown. List fields are `[]` when empty, never `null`.

Response `404`: same envelope as 3.2.

### 3.4 `GET /api/patients/{patientId}/sensors`

Historical CGM readings, ordered ascending by `timestamp`. Phase 3 fixture is 24 hours of readings.

Response `200`:

```json
{
  "patient_id": "P001",
  "signal": "cgm",
  "unit": "mg/dL",
  "readings": [
    { "timestamp": "2026-10-08T08:00:00Z", "value": 95 },
    { "timestamp": "2026-10-08T08:15:00Z", "value": 103 },
    { "timestamp": "2026-10-08T08:30:00Z", "value": null }
  ]
}
```

A missed reading is kept as an entry with `"value": null`, so gaps stay visible in the chart. A patient with no readings returns `"readings": []`.

Response `404`: same envelope as 3.2.

## 4. Prediction Routes

### 4.1 `POST /api/predictions/{patientId}/refresh`

Loads the patient and history, calls the internal ML service (section 6), validates the response, stores it as the latest result, and returns it. No request body.

Response `200`:

```json
{
  "patient_id": "P001",
  "risk_probability": 0.72,
  "risk_band": "high",
  "prediction_window_minutes": 120,
  "generated_at": "2026-10-09T14:30:00Z",
  "prediction_source": "mock",
  "model_version": "mock-v1",
  "top_factors": [
    "Recent meal 45g carbs",
    "Rising glucose slope (+15 mg/dL/30min)"
  ]
}
```

Phase 3 requirements: `prediction_source` must be `"mock"`, `model_version` must be `"mock-v1"`, `prediction_window_minutes` must be `120`. The backend passes these through unchanged. Factors are mock explanation text.

Failure `503` (ML down or timed out):

```json
{
  "code": "ML_SERVICE_UNAVAILABLE",
  "message": "The prediction service is currently unavailable. Please retry.",
  "timestamp": "2026-10-09T14:30:05Z"
}
```

Failure `502`: `ML_BAD_RESPONSE`, same envelope. Failure `404`: `PATIENT_NOT_FOUND`.

**On failed refresh:** the backend never fabricates a score. A previously stored result stays retrievable through 4.2, where it keeps its original `generated_at` so it can't be mistaken for a fresh one.

### 4.2 `GET /api/predictions/{patientId}/current`

Returns the latest stored prediction, same shape as 4.1.

**No-result state** (patient exists, no refresh yet): `200` with an explicit empty marker, so the UI can tell "none yet" apart from an error.

```json
{
  "patient_id": "P001",
  "status": "no_prediction",
  "message": "No prediction has been generated yet. Use refresh to create one."
}
```

A stored result carries `"status": "available"` alongside the 4.1 fields. The frontend branches on `status`.

Response `404`: `PATIENT_NOT_FOUND` for unknown patients only.

## 5. Field Reference: Prediction

| Field | Type | Required | Notes |
|---|---|---|---|
| `patient_id` | string | yes | Must equal the requested patient. |
| `risk_probability` | number | yes | 0.0 to 1.0 inclusive. UI shows `risk_probability * 100` as a percent. |
| `risk_band` | string | yes | `low`, `moderate` or `high` (lowercase). Boundaries are demo configuration, separate from the clinical event definition. |
| `prediction_window_minutes` | integer | yes | `120` in Phase 3. |
| `generated_at` | string | yes | UTC time the prediction was produced. Changes on every call. |
| `prediction_source` | string | yes | `mock` in Phase 3. Frontend must display it visibly. |
| `model_version` | string | yes | `mock-v1` in Phase 3. |
| `top_factors` | string[] | yes | Mock explanation text in Phase 3. May be `[]`. |

## 6. Internal ML Service Contract (owned by M1)

Internal only. Called by Spring Boot, never by the browser.

### 6.1 `GET /health`

Response `200`: `{ "status": "ok" }`

### 6.2 `POST /ml/predict-glucose-spike`

Request:

```json
{
  "patient_id": "P001",
  "as_of_time": "2026-10-09T08:00:00Z",
  "ehr": {
    "hba1c_percent": 8.1,
    "bmi": 29.4,
    "fasting_glucose_mg_dl": 142,
    "years_since_diagnosis": 6,
    "medications": ["metformin"],
    "comorbidities": ["hypertension"]
  },
  "history": [
    { "timestamp": "2026-10-08T08:00:00Z", "glucose_mg_dl": 95 },
    { "timestamp": "2026-10-08T08:15:00Z", "glucose_mg_dl": 103 }
  ]
}
```

Response `200`: identical fields to section 5. `patient_id` is echoed back. `as_of_time` is the historical snapshot time; `generated_at` is the current UTC time and is a separate value.

The mock is deterministic: the same input returns the same score and band. Only `generated_at` varies.

Backend validation before accepting an ML response: `patient_id` matches, `risk_probability` is within 0..1, and all required fields are present. Otherwise the backend returns `502 ML_BAD_RESPONSE`.

Backend client timeouts (proposed): connect 3s, response 5s.

## 7. Future Contract: MQTT Event (Phase 4, specification only)

Recorded for alignment. **Not implemented before Phase 4.**

```json
{
  "event_id": "evt-0001",
  "patient_id": "P001",
  "timestamp": "2026-10-09T10:30:00Z",
  "signal": "cgm",
  "value": 156,
  "unit": "mg/dL"
}
```

`event_id` is unique per event, to allow idempotent ingestion. Topic format is in `TECH_STACK_AND_FILE_STRUCTURE.md`.

## 8. Open Decisions

| # | Question | Owner | Proposed default |
|---|---|---|---|
| 1 | `risk_band` casing and values. `TECH_STACK_AND_FILE_STRUCTURE.md` uses lowercase `"high"`. | M1 + M2 | Lowercase `low` / `moderate` / `high`. |
| 2 | Final EHR field list and units for 3.3. | M3 | Fields as drafted above. |
| 3 | Risk-band probability boundaries. | M3 + M1 | Demo config only, e.g. `<0.33` low, `<0.66` moderate, else high. |
| 4 | `current` no-result shape: `200` with `status`, or `404`. | M2 + M1 | `200` with `status: "no_prediction"`. |
| 5 | Demo patient fields in 3.1/3.2 (`display_name`, `age`, `sex`). | M3 | Synthetic values only, no real identifiers. |
| 6 | CORS: allow `http://localhost:5173` directly, or use a Vite proxy. | M1 + M2 | Direct CORS allow for local dev. |
| 7 | Whether `history` sent to ML is the full 24h or a trailing window. | M1 | Full 24h fixture in Phase 3. |

## 9. Change Log

| Date | Change |
|---|---|
| 2026-10-09 | Initial Phase 1 draft. |