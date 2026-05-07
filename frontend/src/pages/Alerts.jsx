import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Alerts({ data }) {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = [];
    if (data.cpu > 80) newAlerts.push({ id: Date.now() + 1, type: "danger", msg: `CPU at ${data.cpu}% — critically high`, time: new Date().toLocaleTimeString() });
    else if (data.cpu > 60) newAlerts.push({ id: Date.now() + 2, type: "warning", msg: `CPU at ${data.cpu}% — elevated`, time: new Date().toLocaleTimeString() });
    if (data.memoryPercent > 85) newAlerts.push({ id: Date.now() + 3, type: "danger", msg: `Memory at ${data.memoryPercent}% — run cleanup`, time: new Date().toLocaleTimeString() });
    else if (data.memoryPercent > 70) newAlerts.push({ id: Date.now() + 4, type: "warning", msg: `Memory at ${data.memoryPercent}% — monitor closely`, time: new Date().toLocaleTimeString() });
    if (newAlerts.length === 0) newAlerts.push({ id: Date.now() + 5, type: "success", msg: "System running optimally", time: new Date().toLocaleTimeString() });

    setAlerts(prev => {
      const combined = [...newAlerts, ...prev].slice(0, 50);
      return combined;
    });
  }, [data.cpu, data.memoryPercent]);

  const colors = { danger: theme.red, warning: theme.amber, success: theme.green };
  const icons = { danger: "🚨", warning: "⚠️", success: "✅" };

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>Alerts</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Live system event log</p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <AnimatePresence>
          {alerts.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i === 0 ? 0 : 0 }}
              style={{
                display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px",
                borderRadius: "12px",
                background: colors[a.type] + "11",
                border: `1px solid ${colors[a.type]}33`,
              }}>
              <span style={{ fontSize: "16px" }}>{icons[a.type]}</span>
              <span style={{ flex: 1, fontSize: "13px", color: theme.text }}>{a.msg}</span>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>{a.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}