package com.flux.monitor.service;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.sun.management.OperatingSystemMXBean;

@Service
public class SystemMetricsService {

    public Map<String, Object> getMetrics() {
        Map<String, Object> data = new HashMap<>();

        OperatingSystemMXBean osBean =
            (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

        // CPU usage as percentage
        double cpu = osBean.getCpuLoad() * 100;

        // Memory
        long totalMemory = osBean.getTotalMemorySize();
        long freeMemory = osBean.getFreeMemorySize();
        long usedMemory = totalMemory - freeMemory;

        // Convert to MB for readability
        long totalMB = totalMemory / (1024 * 1024);
        long usedMB = usedMemory / (1024 * 1024);
        double memoryPercent = ((double) usedMB / totalMB) * 100;

        data.put("cpu", Math.round(cpu * 10.0) / 10.0);
        data.put("memoryUsedMB", usedMB);
        data.put("memoryTotalMB", totalMB);
        data.put("memoryPercent", Math.round(memoryPercent * 10.0) / 10.0);

        // Alerts
        if (cpu > 80) data.put("alert", "⚠️ High CPU Usage!");
        else if (memoryPercent > 85) data.put("alert", "⚠️ High Memory Usage!");

        return data;
    }
}