package com.happyhealth.virtualpatient.service;

import com.happyhealth.virtualpatient.api.ApiModels.CgmIngestRequest;
import com.happyhealth.virtualpatient.api.ApiModels.CgmView;
import com.happyhealth.virtualpatient.api.ApiModels.PatientView;
import com.happyhealth.virtualpatient.api.ApiModels.TwinView;
import com.happyhealth.virtualpatient.domain.CgmReading;
import com.happyhealth.virtualpatient.domain.PatientProfile;
import com.happyhealth.virtualpatient.repository.CgmReadingRepository;
import com.happyhealth.virtualpatient.repository.PatientRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TwinService {
    private final PatientRepository patients;
    private final CgmReadingRepository readings;
    private final PredictionStore predictions;

    public TwinService(PatientRepository patients, CgmReadingRepository readings,
                       PredictionStore predictions) {
        this.patients = patients;
        this.readings = readings;
        this.predictions = predictions;
    }

    public PatientProfile patient(String patientId) {
        return patients.findById(patientId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    public List<CgmReading> recentReadings(String patientId) {
        patient(patientId);
        return readings.findTop96ByPatientIdOrderByObservedAtDesc(patientId).stream()
                .sorted(Comparator.comparing(CgmReading::getObservedAt)).toList();
    }

    public synchronized boolean ingest(String patientId, CgmIngestRequest request) {
        patient(patientId);
        if (readings.existsByPatientIdAndEventId(patientId, request.eventId())) {
            return false;
        }
        try {
            readings.saveAndFlush(new CgmReading(request.eventId(), patientId,
                    request.observedAt(), request.glucoseMgDl(), request.source()));
            return true;
        } catch (DataIntegrityViolationException error) {
            if (readings.existsByPatientIdAndEventId(patientId, request.eventId())) {
                return false;
            }
            throw error;
        }
    }

    public TwinView view(String patientId) {
        PatientProfile patient = patient(patientId);
        List<CgmView> cgm = recentReadings(patientId).stream().map(TwinService::toView).toList();
        CgmView latest = cgm.isEmpty() ? null : cgm.get(cgm.size() - 1);
        Instant now = Instant.now();
        boolean futureTimestamp = latest != null && latest.observedAt().isAfter(now);
        Long age = latest == null || futureTimestamp ? null
                : Duration.between(latest.observedAt(), now).toSeconds();
        String timelineMode = latest != null
                && "synthetic-cgm-simulator".equals(latest.source())
                ? "accelerated_simulation" : "synthetic_fixture";
        var stored = predictions.get(patientId);
        return new TwinView("1.0", true, true, toView(patient), cgm, latest, age,
                timelineMode, futureTimestamp,
                stored == null ? null : stored.prediction(),
                stored == null ? null : stored.updatedAt());
    }

    private static CgmView toView(CgmReading value) {
        return new CgmView(value.getEventId(), value.getObservedAt(),
                value.getGlucoseMgDl(), value.getSource());
    }

    private static PatientView toView(PatientProfile value) {
        return new PatientView(value.getPatientId(), value.getDisplayName(), value.getSex(),
                value.getAgeYears(), value.getBmiKgM2(), value.getDiabetesDurationYears(),
                value.getHba1cPercent(), value.getFastingPlasmaGlucoseMgDl(),
                value.getDiagnoses(), value.getMedications());
    }
}
