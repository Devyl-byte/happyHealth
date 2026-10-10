"""FastAPI entry point for HappyHealth model inference."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException

from app.feature_builder import InsufficientHistoryError, build_features
from app.model_service import MODEL_VERSION, TARGET_DEFINITION, ModelService
from app.schemas import HealthResponse, PredictionRequest, PredictionResponse


app = FastAPI(
    title="HappyHealth ML Service",
    version="1.0.0",
    description="Research-only two-hour glucose-spike prediction service.",
)
model_service = ModelService()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if model_service.loaded else "degraded",
        modelLoaded=model_service.loaded,
        modelVersion=MODEL_VERSION,
    )


@app.post("/ml/predict-glucose-spike", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    if not model_service.loaded:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "The trained model is unavailable.",
                "modelVersion": MODEL_VERSION,
            },
        )
    try:
        features, data_warnings = build_features(request)
    except InsufficientHistoryError as error:
        return PredictionResponse(
            patientId=request.patient.patientId,
            status="insufficient_data",
            predictionTime=request.predictionTime,
            modelVersion=MODEL_VERSION,
            targetDefinition=TARGET_DEFINITION,
            warnings=[
                str(error),
                "Research prototype using a synthetic demonstration patient.",
            ],
        )

    model_score, factors = model_service.predict(features)
    return PredictionResponse(
        patientId=request.patient.patientId,
        status="available",
        modelScore=model_score,
        predictionTime=request.predictionTime,
        modelVersion=MODEL_VERSION,
        targetDefinition=TARGET_DEFINITION,
        topFactors=factors,
        warnings=data_warnings
        + [
            "The model score is not a calibrated clinical probability.",
            "Research prototype using a synthetic demonstration patient.",
        ],
    )
