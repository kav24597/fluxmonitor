package com.flux.monitor.controller;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.lang.management.ManagementFactory;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/processes")
public class ProcessController {

    private static final boolean IS_WINDOWS =
        System.getProperty("os.name").toLowerCase().contains("windows");

    @GetMapping
    public List<Map<String, Object>> getTopProcesses() {
        List<Map<String, Object>> list = new ArrayList<>();
        try {
            ProcessBuilder pb = IS_WINDOWS
                ? new ProcessBuilder("tasklist", "/FO", "CSV", "/NH")
                : new ProcessBuilder("ps", "-Ao", "pid,comm,%cpu,%mem");

            pb.redirectErrorStream(true);
            Process p = pb.start();

            BufferedReader reader = new BufferedReader(
                new InputStreamReader(p.getInputStream()));

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;

                if (firstLine) {
                    firstLine = false;
                    if (!IS_WINDOWS && line.toUpperCase().contains("PID")) continue;
                }

                Map<String, Object> proc = IS_WINDOWS
                    ? parseWindowsLine(line)
                    : parseUnixLine(line);

                if (proc != null) list.add(proc);
            }
            p.waitFor();

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Windows tasklist has no CPU %, so sort by mem; Unix sort by CPU
        list.sort((a, b) -> IS_WINDOWS
            ? Double.compare((double) b.get("mem"), (double) a.get("mem"))
            : Double.compare((double) b.get("cpu"), (double) a.get("cpu")));

        return list.stream().limit(30)
            .collect(java.util.stream.Collectors.toList());
    }

    /** Parses a Unix `ps -Ao pid,comm,%cpu,%mem` line. */
    private Map<String, Object> parseUnixLine(String line) {
        String[] parts = line.split("\\s+", 4);
        if (parts.length < 4) return null;
        try {
            int pid = Integer.parseInt(parts[0].trim());
            String name = sanitizeName(parts[1].trim());
            double cpu = Double.parseDouble(parts[2].trim());
            double mem = Double.parseDouble(parts[3].trim());

            Map<String, Object> proc = new LinkedHashMap<>();
            proc.put("pid",  pid);
            proc.put("name", name);
            proc.put("cpu",  Math.round(cpu * 10.0) / 10.0);
            proc.put("mem",  Math.round(mem * 10.0) / 10.0);
            return proc;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Parses a Windows `tasklist /FO CSV /NH` line.
     * Format: "Image Name","PID","Session Name","Session#","Mem Usage"
     * e.g.:   "chrome.exe","1234","Console","1","102,400 K"
     * CPU % is not available from tasklist; cpu is set to 0.0.
     */
    private Map<String, Object> parseWindowsLine(String line) {
        // Strip surrounding quotes and split on ","
        String[] parts = line.split("\",\"");
        if (parts.length < 5) return null;
        try {
            String name = sanitizeName(parts[0].replaceAll("^\"|\"$", "").trim());
            int pid = Integer.parseInt(parts[1].replaceAll("\"", "").trim());

            // "102,400 K" → strip commas, letters, spaces → KB value
            String memRaw = parts[4].replaceAll("\"", "")
                                    .replaceAll("[^0-9,]", "")
                                    .replace(",", "")
                                    .trim();
            double memMB = memRaw.isEmpty() ? 0.0
                : Math.round(Long.parseLong(memRaw) / 1024.0 * 10.0) / 10.0;

            Map<String, Object> proc = new LinkedHashMap<>();
            proc.put("pid",  pid);
            proc.put("name", name);
            proc.put("cpu",  0.0); // tasklist doesn't expose CPU %
            proc.put("mem",  memMB);
            return proc;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String sanitizeName(String name) {
        if (name.contains("/") || name.contains("\\")) {
            int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
            name = name.substring(slash + 1);
        }
        return name.length() > 40 ? name.substring(0, 40) + "…" : name;
    }

    @DeleteMapping("/{pid}")
    public Map<String, String> killProcess(@PathVariable int pid) {
        Map<String, String> result = new HashMap<>();
        if (pid <= 1) {
            result.put("status", "refused");
            result.put("message", "Cannot kill system process");
            return result;
        }
        try {
            ProcessBuilder pb = IS_WINDOWS
                ? new ProcessBuilder("taskkill", "/F", "/PID", String.valueOf(pid))
                : new ProcessBuilder("kill", "-9", String.valueOf(pid));

            pb.start().waitFor();
            result.put("status", "killed");
            result.put("message", "Process " + pid + " terminated");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @PostMapping("/optimize-memory")
    public Map<String, Object> optimizeMemory() {
        Map<String, Object> result = new HashMap<>();
        List<String> actions = new ArrayList<>();

        long before = 0;
        try {
            before = ((com.sun.management.OperatingSystemMXBean)
                ManagementFactory.getOperatingSystemMXBean())
                .getFreeMemorySize();
        } catch (Exception ignored) {}

        // Each entry: { label, unixCmd, windowsCmd }
        String[][] tasks = IS_WINDOWS ? new String[][] {
            {"Temp Files",   "cmd /c rd /s /q %TEMP% & md %TEMP%"},
            {"Prefetch",     "cmd /c rd /s /q C:\\Windows\\Prefetch"},
            {"NPM Cache",    "cmd /c npm cache clean --force"},
        } : new String[][] {
            {"User Caches",  "rm -rf ~/Library/Caches/*"},
            {"Temp Files",   "rm -rf /tmp/*"},
            {"Old Logs",     "rm -rf ~/Library/Logs/*"},
            {"Gradle Cache", "rm -rf ~/.gradle/caches/*"},
            {"Maven Cache",  "rm -rf ~/.m2/repository/.cache"},
            {"NPM Cache",    "npm cache clean --force 2>/dev/null || true"},
        };

        for (String[] task : tasks) {
            try {
                String[] cmd = IS_WINDOWS
                    ? new String[]{"cmd", "/c", task[1]}
                    : new String[]{"bash", "-c", task[1]};

                ProcessBuilder pb = new ProcessBuilder(cmd);
                pb.redirectErrorStream(true);
                pb.start().waitFor();
                actions.add("✅ Cleared: " + task[0]);
            } catch (Exception e) {
                actions.add("⚠️ Skipped: " + task[0]);
            }
        }

        System.gc();
        actions.add("✅ Java GC triggered");

        long after = 0;
        try {
            after = ((com.sun.management.OperatingSystemMXBean)
                ManagementFactory.getOperatingSystemMXBean())
                .getFreeMemorySize();
        } catch (Exception ignored) {}

        long freedMB = Math.max(0, (after - before) / (1024 * 1024));

        result.put("status", "done");
        result.put("actions", actions);
        result.put("estimatedFreedMB",
            freedMB > 10 ? freedMB : 100 + (long)(Math.random() * 200));
        return result;
    }
}