package com.happyhealth.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

@Component
public class MlServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MlServiceClient.class);

    private final WebClient mlWebClient;

    // Constructor injection — Spring finds the WebClient bean by type automatically
    public MlServiceClient(WebClient mlWebClient) {
        this.mlWebClient = mlWebClient;
    }

    /**
     * Calls GET /health on the ML service.
     * Returns true if reachable, false if down or timed out.
     */
    public boolean isHealthy() {
        try {
            mlWebClient.get()
                    .uri("/health")
                    .retrieve()
                    .toBodilessEntity()   // don't need the body, just the status code
                    .block();             // turn reactive → blocking (fine for Phase 2)
            return true;
        } catch (WebClientException | IllegalStateException e) {
            log.warn("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }
}