"""Load the trained model and translate its output into the API contract."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.feature_builder import MODEL_FEATURE_COLUMNS
from app.schemas import Factor


MODEL_VERSION = "shanghai-logistic-v1"
TARGET_DEFINITION = (
    "Within 120 minutes after the meal, glucose either reaches at least "
    "180 mg/dL or rises by at least 40 mg/dL above the meal-time baseline."
)
DEFAULT_MODEL_PATH = Path(__file__).parent / "artifacts" / "logistic_regression.joblib"
DEFAULT_METADATA_PATH = Path(__file__).parent / "artifacts" / "model_metadata.json"

DISPLAY_NAMES = {
    "baseline_glucose_mg_dl": "Current glucose",
    "glucose_change_prev_15_min_mg_dl": "15-minute glucose change",
    "glucose_change_prev_30_min_mg_dl": "30-minute glucose change",
    "glucose_change_prev_60_min_mg_dl": "60-minute glucose change",
    "glucose_change_prev_120_min_mg_dl": "Two-hour glucose change",
    "glucose_mean_prev_120_min_mg_dl": "Two-hour average glucose",
    "glucose_std_prev_120_min_mg_dl": "Two-hour glucose variability",
    "minutes_since_previous_meal": "Time since previous meal",
    "reported_food_weight_g": "Reported food weight",
    "hba1c_percent": "HbA1c",
    "fasting_plasma_glucose_mg_dl": "Fasting plasma glucose",
}


class ModelService:
    def __init__(
        self,
        model_path: Path | None = None,
        metadata_path: Path | None = None,
    ) -> None:
        configured = os.getenv("HAPPYHEALTH_MODEL_PATH")
        self.model_path = model_path or (Path(configured) if configured else DEFAULT_MODEL_PATH)
        self.metadata_path = metadata_path or DEFAULT_METADATA_PATH
        self.model = None
        self.metadata: dict = {}
        self.load_error: str | None = None
        self._load()

    @property
    def loaded(self) -> bool:
        return self.model is not None

    def _load(self) -> None:
        try:
            self.metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))
            if self.metadata.get("modelVersion") != MODEL_VERSION:
                raise ValueError("Model metadata version does not match the service version.")
            if self.metadata.get("targetDefinition") != TARGET_DEFINITION:
                raise ValueError("Model metadata target does not match the service target.")
            expected_hash = self.metadata.get("artifactSha256")
            actual_hash = hashlib.sha256(self.model_path.read_bytes()).hexdigest()
            if expected_hash != actual_hash:
                raise ValueError("Model artifact checksum does not match its metadata.")
            self.model = joblib.load(self.model_path)
            model_features = list(getattr(self.model, "feature_names_in_", []))
            if model_features != MODEL_FEATURE_COLUMNS:
                raise ValueError(
                    "Model feature schema does not match the live feature builder."
                )
            if self.metadata.get("featureCount") != len(model_features):
                raise ValueError("Model metadata feature count is incorrect.")
        except Exception as error:  # surfaced through health and 503 responses
            self.model = None
            self.load_error = str(error)

    def predict(self, features: pd.DataFrame) -> tuple[float, list[Factor]]:
        if self.model is None:
            raise RuntimeError(self.load_error or "Model is not loaded")
        classes = list(self.model.classes_)
        model_score = float(self.model.predict_proba(features)[0, classes.index(1)])
        return model_score, self._top_factors(features)

    def _top_factors(self, features: pd.DataFrame) -> list[Factor]:
        imputer = self.model.named_steps["imputer"]
        scaler = self.model.named_steps["scaler"]
        classifier = self.model.named_steps["classifier"]
        imputed = imputer.transform(features)
        scaled = scaler.transform(imputed)
        coefficients = classifier.coef_[0]
        names = imputer.get_feature_names_out(MODEL_FEATURE_COLUMNS)
        contributions = scaled[0] * coefficients
        ordered = np.argsort(np.abs(contributions))[::-1]
        factors: list[Factor] = []
        for index in ordered:
            feature = str(names[index])
            if feature.startswith("missingindicator_"):
                display_name = "Missing input: " + feature.removeprefix(
                    "missingindicator_"
                ).replace("_", " ")
            else:
                display_name = DISPLAY_NAMES.get(feature, feature.replace("_", " "))
            contribution = float(contributions[index])
            if abs(contribution) < 1e-12:
                continue
            factors.append(
                Factor(
                    feature=feature,
                    displayName=display_name,
                    direction="higher" if contribution > 0 else "lower",
                    contribution=round(contribution, 4),
                )
            )
            if len(factors) == 5:
                break
        return factors
