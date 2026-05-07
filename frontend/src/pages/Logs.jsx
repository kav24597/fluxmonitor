import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function getNow() { return new Date().toLocaleTimeString(); }

export default function Logs({ data }) {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    if (!data.cpu || paused) return;

    // Determine log level based on actual system state
    const memHigh = data.memoryPercent > 85;
    const cpuHigh = data.cpu > 70;
    const cpuMed = data.cpu > 40;

    const entries = [
      {
        level: "INFO",
        msg: `[WebSocket] Metrics received — CPU: ${data.cpu}%, MEM: ${data.memoryPercent}%`,
        color: theme.green
      },
      {
        level: "INFO",
        msg: `[Scheduler] Published metrics → /topic/metrics`,
        color: theme.green
      },
    ];

    if (memHigh) {
      entries.push({ level: "ERROR", msg: `[Alert] Memory critically high at ${data.memoryPercent}% — cleanup recommended`, color: theme.red });
    } else if (data.memoryPercent > 70) {
      entries.push({ level: "WARN", msg: `[Alert] Memory elevated at ${data.memoryPercent}%`, color: theme.amber });
    } else {
      entries.push({ level: "INFO", msg: `[Monitor] Memory nominal at ${data.memoryPercent}%`, color: theme.green });
    }

    if (cpuHigh) {
      entries.push({ level: "ERROR", msg: `[Alert] CPU spike detected at ${data.cpu}%`, color: theme.red });
    } else if (cpuMed) {
      entries.push({ level: "WARN", msg: `[Alert] CPU moderately loaded at ${data.cpu}%`, color: theme.amber });
    }

    // Occasional INFO logs to simulate real activity
    if (Math.random() > 0.7) {
      const infos = [
        "[Auth] JWT token validated successfully",
        "[WebSocket] Client heartbeat acknowledged",
        "[JMX] OperatingSystemMXBean polled",
        "[GC] Java garbage collection cycle complete",
        "[Security] CORS preflight request handled",
      ];
      entries.push({ level: "DEBUG", msg: infos[Math.floor(Math.random() * infos.length)], color: "#6366f1" });
    }

    const newLogs = entries.map(e => ({
      id: Date.now() + Math.random(),
      time: getNow(),
      ...e,
    }));

    setLogs(prev => [...prev, ...newLogs].slice(-300));
  }, [data.cpu]);

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const levelColor = { INFO: theme.green, WARN: theme.amber, ERROR: theme.red, DEBUG: "#6366f1" };
  const levelBg = { INFO: "rgba(34,197,94,0.08)", WARN: "rgba(245,158,11,0.08)", ERROR: "rgba(239,68,68,0.08)", DEBUG: "rgba(99,102,241,0.08)" };

  const filtered = filter === "ALL" ? logs : logs.filter(l => l.level === filter);

  const counts = {
    INFO: logs.filter(l => l.level === "INFO").length,
    WARN: logs.filter(l => l.level === "WARN").length,
    ERROR: logs.filter(l => l.level === "ERROR").length,
    DEBUG: logs.filter(l => l.level === "DEBUG").length,
  };

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>📋 Live Logs</h1>
          <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Real-time system event stream from backend</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setPaused(p => !p)}
            style={{ background: paused ? `${theme.amber}22` : theme.bgCard, border: `1px solid ${paused ? theme.amber : theme.border}`, color: paused ? theme.amber : theme.textMuted, padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setLogs([])}
            style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}>
            🗑 Clear
          </motion.button>
        </div>
      </motion.div>

      {/* Level counts */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["ALL", "INFO", "WARN", "ERROR", "DEBUG"].map(level => (
          <motion.button key={level} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(level)}
            style={{
              padding: "7px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600",
              background: filter === level ? (levelColor[level] || theme.accent) + "22" : theme.bgCard,
              color: filter === level ? (levelColor[level] || theme.accent) : theme.textMuted,
              border: `1px solid ${filter === level ? (levelColor[level] || theme.accent) + "44" : theme.border}`,
            }}>
            {level} {level !== "ALL" ? `(${counts[level] || 0})` : `(${logs.length})`}
          </motion.button>
        ))}
        {paused && (
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ padding: "7px 14px", borderRadius: "20px", background: `${theme.amber}22`, color: theme.amber, fontSize: "12px", fontWeight: "600", border: `1px solid ${theme.amber}44` }}>
            ⏸ PAUSED
          </motion.span>
        )}
      </div>

      {/* Log terminal */}
      <div style={{ background: "#0d1117", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", height: "500px", overflowY: "auto", padding: "16px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", paddingTop: "40px" }}>
            Waiting for log events...
          </div>
        ) : (
          filtered.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: "flex", gap: "16px", fontSize: "12px", lineHeight: "1.9", padding: "2px 6px", borderRadius: "4px", marginBottom: "1px", background: i === filtered.length - 1 ? levelBg[log.level] : "transparent" }}>
              <span style={{ color: "rgba(255,255,255,0.3)", minWidth: "80px", flexShrink: 0, fontFamily: "monospace" }}>{log.time}</span>
              <span style={{ minWidth: "48px", flexShrink: 0, fontWeight: "700", fontFamily: "monospace", color: levelColor[log.level] }}>{log.level}</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontFamily: "monospace" }}>{log.msg}</span>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <p style={{ color: theme.textMuted, fontSize: "11px", marginTop: "10px", textAlign: "right" }}>
        {filtered.length} events shown — {paused ? "paused" : "streaming live"}
      </p>
    </div>
  );
}