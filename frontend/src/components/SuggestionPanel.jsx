import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function getSuggestions(cpu, memPercent) {
  const tips = [];
  if (memPercent > 85) {
    tips.push({ icon: "🧹", text: "Memory critically high — clear caches now", action: true, severity: "high" });
    tips.push({ icon: "📵", text: "Close unused browser tabs and background apps", severity: "high" });
  } else if (memPercent > 70) {
    tips.push({ icon: "⚠️", text: "Memory above 70% — consider closing heavy apps", severity: "medium" });
  }
  if (cpu > 80) {
    tips.push({ icon: "🔥", text: "CPU overloaded — check Activity Monitor for runaway processes", severity: "high" });
  } else if (cpu > 60) {
    tips.push({ icon: "📊", text: "CPU elevated — reduce background tasks if possible", severity: "medium" });
  }
  if (cpu < 30 && memPercent < 70) {
    tips.push({ icon: "✅", text: "System running optimally — no action needed", severity: "good" });
  }
  tips.push({ icon: "🔄", text: "Run cleanup to clear temp files and free memory", action: true, severity: "info" });
  return tips;
}

const severityColor = { high: "#ef4444", medium: "#f59e0b", good: "#22c55e", info: "#6366f1" };

export default function SuggestionPanel({ cpu, memPercent }) {
  const [cleaning, setCleaning] = useState(false);
  const [cleanLog, setCleanLog] = useState(null);
  const tips = getSuggestions(cpu, memPercent);

  const runCleanup = async () => {
    setCleaning(true);
    setCleanLog(null);
    try {
      const res = await fetch("http://localhost:8080/api/cleanup", { method: "POST" });
      const data = await res.json();
      setCleanLog(data.log);
    } catch {
      setCleanLog("⚠️ Cleanup ran — check backend logs.");
    }
    setCleaning(false);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
    }}>
      <p style={{ color: "#9ca3af", marginBottom: "20px", fontWeight: "600", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>
        🧠 Smart Suggestions
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {tips.map((tip, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: `${severityColor[tip.severity]}11`,
              border: `1px solid ${severityColor[tip.severity]}33`,
            }}
          >
            <span style={{ fontSize: "18px" }}>{tip.icon}</span>
            <span style={{ fontSize: "13px", color: "#d1d5db", flex: 1 }}>{tip.text}</span>
            {tip.action && (
              <button onClick={runCleanup} disabled={cleaning} style={{
                background: "#6366f1",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                color: "white",
                fontSize: "11px",
                fontWeight: "600",
                cursor: cleaning ? "not-allowed" : "pointer",
                opacity: cleaning ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}>
                {cleaning ? "Cleaning..." : "Clean Now"}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {cleanLog && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: "16px", padding: "14px", borderRadius: "12px",
              background: "rgba(99,102,241,0.1)", border: "1px solid #6366f144",
              fontSize: "12px", color: "#a5b4fc", whiteSpace: "pre-line", lineHeight: "1.8"
            }}>
            {cleanLog}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}