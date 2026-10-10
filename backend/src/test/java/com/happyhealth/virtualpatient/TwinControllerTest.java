package com.happyhealth.virtualpatient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.happyhealth.virtualpatient.repository.CgmReadingRepository;
import com.happyhealth.virtualpatient.repository.PatientRepository;
import com.happyhealth.virtualpatient.domain.CgmReading;
import com.happyhealth.virtualpatient.domain.PatientProfile;
import com.happyhealth.virtualpatient.api.ApiModels.CgmIngestRequest;
import com.happyhealth.virtualpatient.service.TwinService;
import com.happyhealth.virtualpatient.service.PredictionCoordinator;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "happyhealth.mqtt.enabled=false")
@AutoConfigureMockMvc
class TwinControllerTest {
    @Autowired MockMvc mvc;
    @Autowired CgmReadingRepository readings;
    @Autowired PatientRepository patients;
    @Autowired TwinService twins;

    @Test
    void demoTwinFusesStaticProfileAndDynamicCgm() throws Exception {
        mvc.perform(get("/api/patients/DEMO-001/twin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.synthetic").value(true))
                .andExpect(jsonPath("$.patient.hba1cPercent").value(7.6))
                .andExpect(jsonPath("$.cgmReadings").isArray())
                .andExpect(jsonPath("$.latestCgm.glucoseMgDl").value(142.0));
    }

    @Test
    void repeatedEventIdIsIdempotent() throws Exception {
        String event = """
                {"eventId":"test-event-1","observedAt":"2026-10-09T10:15:00Z",
                 "glucoseMgDl":148.0,"source":"test"}
                """;
        long before = readings.count();
        mvc.perform(post("/api/patients/DEMO-001/cgm")
                        .contentType(MediaType.APPLICATION_JSON).content(event))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/patients/DEMO-001/cgm")
                        .contentType(MediaType.APPLICATION_JSON).content(event))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.created").value(false));
        assertThat(readings.count()).isEqualTo(before + 1);
    }

    @Test
    void outOfOrderReadingDoesNotReplaceNewestState() throws Exception {
        String patientId = createPatient("ORDER");
        postReading(patientId, "newer", "2030-10-09T10:15:00Z", 180.0)
                .andExpect(status().isCreated());
        postReading(patientId, "older", "2030-10-09T10:00:00Z", 120.0)
                .andExpect(status().isCreated());

        mvc.perform(get("/api/patients/{patientId}/twin", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latestCgm.eventId").value("newer"))
                .andExpect(jsonPath("$.futureTimestamp").value(true))
                .andExpect(jsonPath("$.dataAgeSeconds").doesNotExist());
    }

    @Test
    void missingOptionalLabsDoNotCrashPredictionRefresh() throws Exception {
        String patientId = createPatient("NULL-LABS");
        Instant anchor = Instant.parse("2026-10-09T10:00:00Z");
        for (int index = 0; index < 9; index++) {
            readings.save(new CgmReading("null-labs-" + index, patientId,
                    anchor.minusSeconds((8L - index) * 900L), 110.0 + index, "test"));
        }

        mvc.perform(post("/api/predictions/{patientId}/refresh", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prediction.status").value("unavailable"));
    }

    @Test
    void unknownPatientReturnsNotFound() throws Exception {
        mvc.perform(get("/api/patients/DOES-NOT-EXIST/twin"))
                .andExpect(status().isNotFound());
    }

    @Test
    void oversizedEventIdIsRejected() throws Exception {
        String event = """
                {"eventId":"%s","observedAt":"2026-10-09T10:15:00Z",
                 "glucoseMgDl":148.0,"source":"test"}
                """.formatted("x".repeat(101));
        mvc.perform(post("/api/patients/DEMO-001/cgm")
                        .contentType(MediaType.APPLICATION_JSON).content(event))
                .andExpect(status().isBadRequest());
    }

    @Test
    void concurrentDuplicateEventsCreateOneReading() throws Exception {
        String patientId = createPatient("CONCURRENT");
        String eventId = "shared-" + UUID.randomUUID();
        var request = new CgmIngestRequest(eventId, Instant.parse("2026-10-09T10:15:00Z"),
                148.0, "test");
        try (var executor = Executors.newFixedThreadPool(6)) {
            List<Callable<Boolean>> calls = java.util.stream.IntStream.range(0, 6)
                    .mapToObj(ignored -> (Callable<Boolean>) () -> twins.ingest(patientId, request))
                    .toList();
            long created = executor.invokeAll(calls).stream().filter(future -> {
                try {
                    return future.get();
                } catch (Exception error) {
                    throw new RuntimeException(error);
                }
            }).count();
            assertThat(created).isEqualTo(1);
        }
        assertThat(readings.existsByPatientIdAndEventId(patientId, eventId)).isTrue();
    }

    @Test
    void sameEventIdCanBelongToDifferentPatients() {
        String firstPatient = createPatient("EVENT-SCOPE-A");
        String secondPatient = createPatient("EVENT-SCOPE-B");
        var request = new CgmIngestRequest("device-counter-1",
                Instant.parse("2026-10-09T10:15:00Z"), 148.0, "test");

        assertThat(twins.ingest(firstPatient, request)).isTrue();
        assertThat(twins.ingest(secondPatient, request)).isTrue();
        assertThat(readings.existsByPatientIdAndEventId(firstPatient, request.eventId())).isTrue();
        assertThat(readings.existsByPatientIdAndEventId(secondPatient, request.eventId())).isTrue();
    }

    @Test
    void modelResponseForAnotherPatientIsRejected() {
        var response = new PredictionCoordinator.ModelResponse(
                "OTHER-PATIENT", "available", 0.5, 120,
                Instant.parse("2026-10-09T10:15:00Z"), "shanghai-logistic-v1",
                "Within 120 minutes after the meal, glucose either reaches at least "
                        + "180 mg/dL or rises by at least 40 mg/dL above the meal-time baseline.",
                false, List.of(), List.of());

        assertThatThrownBy(() -> response.toView("EXPECTED-PATIENT"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("patient");
    }

    private String createPatient(String suffix) {
        String patientId = "TEST-" + suffix + "-" + UUID.randomUUID();
        patients.save(new PatientProfile(patientId, "Synthetic Test Patient", "female", 40,
                25, 4, null, null, List.of("Type 2 diabetes mellitus"), List.of()));
        return patientId;
    }

    private org.springframework.test.web.servlet.ResultActions postReading(
            String patientId, String eventId, String observedAt, double glucose) throws Exception {
        String event = """
                {"eventId":"%s","observedAt":"%s","glucoseMgDl":%s,"source":"test"}
                """.formatted(eventId, observedAt, glucose);
        return mvc.perform(post("/api/patients/{patientId}/cgm", patientId)
                .contentType(MediaType.APPLICATION_JSON).content(event));
    }
}
