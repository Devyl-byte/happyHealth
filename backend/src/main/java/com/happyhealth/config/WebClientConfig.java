package com.happyhealth.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.util.concurrent.TimeUnit;

@Configuration          // tells Spring: this class produces beans
public class WebClientConfig {

    @Value("${ml.service.base-url}")
    private String mlBaseUrl;

    @Value("${ml.service.connect-timeout-ms}")
    private int connectTimeoutMs;

    @Value("${ml.service.read-timeout-ms}")
    private int readTimeoutMs;

    @Bean
    public WebClient mlWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeoutMs)
                .doOnConnected(conn ->
                        conn.addHandlerLast(
                                new ReadTimeoutHandler(readTimeoutMs, TimeUnit.MILLISECONDS)
                        )
                );

        return WebClient.builder()
                .baseUrl(mlBaseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}