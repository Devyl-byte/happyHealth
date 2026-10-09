package com.happyhealth.config;

import com.happyhealth.client.MlServiceClient;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("mlService")    // "mlService" is the key shown in the health JSON
public class MlServiceHealthIndicator implements HealthIndicator {

    private final MlServiceClient mlServiceClient;

    public MlServiceHealthIndicator(MlServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    @Override
    public Health health() {
        if (mlServiceClient.isHealthy()) {
            return Health.up()
                    .withDetail("url", "reachable")
                    .build();
        }
        // DOWN is informational — it does NOT crash the backend
        return Health.down()
                .withDetail("url", "unreachable")
                .withDetail("note", "ML service is optional for backend startup")
                .build();
    }
}