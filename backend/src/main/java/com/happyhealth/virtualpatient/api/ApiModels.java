package com.happyhealth.virtualpatient.api;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class ApiModels {
    private ApiModels() {}

    public record CgmIngestRequest(
            @NotBlank @Size(max = 100) String eventId,
            @NotNull Instant observedAt,
            @DecimalMin("40.0") @DecimalMax("500.0") double glucoseMgDl,
            @NotBlank @Size(max = 100) String source) {}

    public record CgmView(String eventId, Instant observedAt, double glucoseMgDl, String source) {}

    public record PatientView(
            String patientId, String displayName, String sex, double ageYears,
            double bmiKgM2, double diabetesDurationYears, Double hba1cPercent,
            Double fastingPlasmaGlucoseMgDl, List<String> diagnoses,
            List<String> medications) {}

    public record FactorView(String feature, String displayName, String direction,
                             double contribution) {}

    public record PredictionView(
            String status, Double modelScore,
            int predictionWindowMinutes, Instant predictionTime,
            String modelVersion, String targetDefinition,
            boolean calibratedProbability, List<FactorView> topFactors,
            List<String> warnings) {}

    public record TwinView(
            String schemaVersion, boolean synthetic, boolean researchUseOnly,
            PatientView patient, List<CgmView> cgmReadings,
            CgmView latestCgm, Long dataAgeSeconds, String timelineMode,
            boolean futureTimestamp,
            PredictionView prediction, Instant predictionUpdatedAt) {}
}
