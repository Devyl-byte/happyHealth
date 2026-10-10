package com.happyhealth.virtualpatient.service;

import com.happyhealth.virtualpatient.api.ApiModels.FactorView;
import com.happyhealth.virtualpatient.api.ApiModels.PredictionView;
import com.happyhealth.virtualpatient.api.ApiModels.TwinView;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PredictionCoordinator {
    private static final Logger log = LoggerFactory.getLogger(PredictionCoordinator.class);
    private static final String TARGET_DEFINITION =
            "Within 120 minutes after the meal, glucose either reaches at least "
                    + "180 mg/dL or rises by at least 40 mg/dL above the meal-time baseline.";
    private final TwinService twins;
    private final PredictionStore store;
    private final DemoFixture demoFixture;
    private final RestClient modelClient;

    public PredictionCoordinator(TwinService twins, PredictionStore store,
                                 DemoFixture demoFixture, RestClient.Builder restClientBuilder,
                                 @Value("${happyhealth.ml.base-url}") String modelBaseUrl) {
        this.twins = twins;
        this.store = store;
        this.demoFixture = demoFixture;
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3_000);
        requestFactory.setReadTimeout(10_000);
        this.modelClient = restClientBuilder.requestFactory(requestFactory)
                .baseUrl(modelBaseUrl).build();
    }

    public TwinView refresh(String patientId) {
        var patient = twins.patient(patientId);
        var readings = twins.recentReadings(patientId);
        if (readings.isEmpty()) {
            store.put(patientId, unavailable(Instant.now(), "No CGM readings are available."));
            return twins.view(patientId);
        }
        Instant predictionTime = readings.get(readings.size() - 1).getObservedAt();
        var fixture = demoFixture.read();
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("schemaVersion", "1.0");
        Map<String, Object> patientRequest = new LinkedHashMap<>();
        patientRequest.put("patientId", patient.getPatientId());
        patientRequest.put("sex", patient.getSex());
        patientRequest.put("ageYears", patient.getAgeYears());
        patientRequest.put("bmiKgM2", patient.getBmiKgM2());
        patientRequest.put("diabetesDurationYears", patient.getDiabetesDurationYears());
        patientRequest.put("hba1cPercent", patient.getHba1cPercent());
        patientRequest.put("fastingPlasmaGlucoseMgDl", patient.getFastingPlasmaGlucoseMgDl());
        request.put("patient", patientRequest);
        request.put("predictionTime", predictionTime);
        request.put("meal", fixture.currentMeal());
        request.put("cgmReadings", readings.stream().map(item -> Map.of(
                "observedAt", item.getObservedAt(), "glucoseMgDl", item.getGlucoseMgDl())).toList());
        try {
            ModelResponse result = modelClient.post().uri("/ml/predict-glucose-spike")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request).retrieve().body(ModelResponse.class);
            if (result == null) {
                throw new IllegalStateException("Model service returned an empty response");
            }
            store.put(patientId, result.toView(patientId));
        } catch (RuntimeException error) {
            log.warn("Prediction unavailable for {}: {}", patientId, error.getMessage());
            store.put(patientId, unavailable(predictionTime,
                    "Prediction service unavailable; no score was fabricated."));
        }
        return twins.view(patientId);
    }

    private static PredictionView unavailable(Instant time, String warning) {
        return new PredictionView("unavailable", null, 120, time,
                "unavailable", TARGET_DEFINITION, false, List.of(), List.of(warning));
    }

    public record ModelResponse(String patientId, String status, Double modelScore,
                                int predictionWindowMinutes, Instant predictionTime,
                                String modelVersion, String targetDefinition,
                                boolean calibratedProbability, List<FactorView> topFactors,
                                List<String> warnings) {
        public PredictionView toView(String expectedPatientId) {
            if (!expectedPatientId.equals(patientId)) {
                throw new IllegalArgumentException("Model response patient does not match request");
            }
            if (!List.of("available", "insufficient_data", "unavailable").contains(status)) {
                throw new IllegalArgumentException("Unsupported model status");
            }
            if (predictionWindowMinutes != 120 || predictionTime == null
                    || modelVersion == null || modelVersion.isBlank()) {
                throw new IllegalArgumentException("Model response contract is incomplete");
            }
            if (!TARGET_DEFINITION.equals(targetDefinition) || calibratedProbability) {
                throw new IllegalArgumentException("Model target or calibration contract changed");
            }
            if ("available".equals(status)
                    && (modelScore == null || modelScore < 0.0 || modelScore > 1.0)) {
                throw new IllegalArgumentException("Available response requires a score from 0 to 1");
            }
            if (!"available".equals(status) && modelScore != null) {
                throw new IllegalArgumentException("Unavailable response must not contain a score");
            }
            return new PredictionView(status, modelScore,
                    predictionWindowMinutes, predictionTime, modelVersion,
                    targetDefinition, false,
                    topFactors == null ? List.of() : topFactors,
                    warnings == null ? List.of() : warnings);
        }
    }
}
