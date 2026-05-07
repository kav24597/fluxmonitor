package com.flux.monitor.websocket;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.flux.monitor.service.SystemMetricsService;

@Component
public class MetricsPublisher {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private SystemMetricsService service;

    @Scheduled(fixedRate = 2000)
    public void sendMetrics() {
        Map<String, Object> data = service.getMetrics();
        messagingTemplate.convertAndSend("/topic/metrics", data);
    }
}