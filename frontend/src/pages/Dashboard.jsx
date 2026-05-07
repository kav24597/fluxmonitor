import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GaugeRing from "../components/GaugeRing";
import LiveChart from "../components/LiveChart";
import { useTheme } from "../context/ThemeContext";

const MAX = 40;
function getNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function MemoryOptimizer({ memPercent }) {
  const { theme } = useTheme();
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState([]);
  const [freed, setFreed] = useState(0);
  const [show, setShow] = useState(true);

  const optimize = async () => {
    setStatus("running");
    setLog(["🔄 Starting memory optimization..."]);
    try {
      const token = localStorage.getItem("flux-token");
      const res = await fetch("https://localhost:8443/api/processes/optimize-memory", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const d = await res.json();
      setLog(d.actions || []);
      setFreed(d.estimatedFreedMB || 0);
      setStatus("done");
    } catch {
      setLog(["⚠️ Backend unreachable — is Spring Boot running?"]);
      setStatus("error");
    }
  };

  if (!show) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: "20px", background: status === "done" ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${status === "done" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "18px", padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: status === "done" ? theme.green : theme.red, fontWeight: "700", fontSize: "15px", margin: "0 0 4px" }}>
            {status === "done" ? `✅ Optimization Complete — ${freed} MB freed` : `🚨 Memory at ${memPercent}% — Optimize Now`}
          </p>
          <p style={{ color: theme.textMuted, fontSize: "12px", margin: 0 }}>
            {status === "idle" && "Clears caches, temp files, logs, Xcode/Gradle/Maven/NPM caches + memory purge"}
            {status === "running" && "Working... this may take a few seconds"}
            {status === "done" && "Caches cleared, GC triggered, memory purged"}
            {status === "error" && "Could not reach backend optimizer"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {status !== "running" && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={optimize}
              style={{ background: status === "done" ? theme.green : theme.red, border: "none", borderRadius: "10px", padding: "10px 20px", color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {status === "done" ? "Run Again" : "⚡ Optimize Memory"}
            </motion.button>
          )}
          {status === "running" && (
            <div style={{ padding: "10px 20px", color: theme.textMuted, fontSize: "13px" }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>⚙️ Optimizing...</motion.span>
            </div>
          )}
          <button onClick={() => setShow(false)} style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "10px 12px", color: theme.textMuted, cursor: "pointer", fontSize: "12px" }}>✕</button>
        </div>
      </div>

      <AnimatePresence>
        {log.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
            style={{ marginTop: "14px", padding: "14px 16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", maxHeight: "160px", overflowY: "auto" }}>
            {log.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ fontSize: "12px", color: theme.textMuted, lineHeight: "2", fontFamily: "monospace" }}>{l}</motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Dashboard({ data }) {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!data.cpu && !data.memoryPercent) return;
    setHistory(p => {
      const n = [...p, { time: getNow(), cpu: data.cpu, memory: data.memoryPercent }];
      return n.length > MAX ? n.slice(-MAX) : n;
    });
  }, [data]);

  const fmt = s => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>Dashboard</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Real-time system overview</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ background: theme.bgCard, borderRadius: "20px", padding: "32px", border: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: "32px", marginBottom: "24px" }}>
          <GaugeRing value={data.cpu} label="CPU Load" color="#6366f1" size={180} />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "RAM Used", val: data.memoryUsedMB, unit: "MB" },
              { label: "RAM Total", val: data.memoryTotalMB, unit: "MB" },
              { label: "Uptime", val: fmt(uptime), unit: "" },
            ].map(s => (
              <div key={s.label} style={{ background: theme.bgCardHover, borderRadius: "12px", padding: "14px 20px", minWidth: "160px" }}>
                <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ color: theme.text, fontSize: "20px", fontWeight: "700", margin: 0 }}>{s.val}<span style={{ fontSize: "12px", color: theme.textMuted, marginLeft: "4px" }}>{s.unit}</span></p>
              </div>
            ))}
          </div>
          <GaugeRing value={data.memoryPercent} label="Memory" color="#22c55e" size={180} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <LiveChart history={history} dataKey="cpu" color="#6366f1" title="CPU History" />
        <LiveChart history={history} dataKey="memory" color="#22c55e" title="Memory History" />
      </motion.div>

      <AnimatePresence>
        {data.memoryPercent > 80 && <MemoryOptimizer memPercent={data.memoryPercent} />}
      </AnimatePresence>
    </div>
  );
}