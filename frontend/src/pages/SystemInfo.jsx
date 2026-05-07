import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function authFetch(url) {
  const token = localStorage.getItem("flux-token");
  return fetch(url, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
}

export default function SystemInfo() {
  const { theme } = useTheme();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    authFetch("http://localhost:8080/api/system-info")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setInfo)
      .catch(() => setError(true));
  }, []);

  const card = { background: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}` };

  const rows = info ? [
    { icon: "💻", label: "Operating System", value: info.os, color: theme.accent },
    { icon: "🔢", label: "OS Version", value: info.osVersion, color: theme.text },
    { icon: "⚙️", label: "Architecture", value: info.arch, color: theme.text },
    { icon: "☕", label: "Java Version", value: info.javaVersion, color: "#f59e0b" },
    { icon: "🧠", label: "CPU Cores", value: `${info.processors} cores`, color: "#22c55e" },
    { icon: "👤", label: "Username", value: info.user, color: theme.accent },
    { icon: "🖥", label: "Hostname", value: info.hostname, color: theme.text },
  ] : [];

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>💻 System Info</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Hardware and environment details from your machine</p>
      </motion.div>

      {error && (
        <div style={{ ...card, padding: "24px", color: theme.red, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          ⚠️ Could not load system info — make sure backend is running and you are logged in.
        </div>
      )}

      {!info && !error && (
        <div style={{ ...card, padding: "40px", textAlign: "center" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: "32px", display: "inline-block", marginBottom: "12px" }}>⚙️</motion.div>
          <p style={{ color: theme.textMuted, fontSize: "13px" }}>Loading system info...</p>
        </div>
      )}

      {info && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...card, overflow: "hidden" }}>
          {rows.map((row, i) => (
            <motion.div key={row.label}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: i < rows.length - 1 ? `1px solid ${theme.border}` : "none", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = theme.bgCardHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>{row.icon}</span>
                <span style={{ color: theme.textMuted, fontSize: "14px" }}>{row.label}</span>
              </div>
              <span style={{ color: row.color, fontSize: "14px", fontWeight: "700", fontFamily: "monospace" }}>{row.value}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Extra info cards */}
      {info && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "24px" }}>
          {[
            { icon: "🧠", label: "CPU Cores", value: info.processors, sub: "Physical cores available", color: "#22c55e" },
            { icon: "☕", label: "Java Runtime", value: "JVM 17", sub: "Powers the backend engine", color: "#f59e0b" },
            { icon: "🌐", label: "Server Port", value: "8080", sub: "Spring Boot listening", color: "#6366f1" },
          ].map((c, i) => (
            <motion.div key={c.label} whileHover={{ scale: 1.02 }}
              style={{ background: theme.bgCard, borderRadius: "16px", padding: "20px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{c.icon}</div>
              <div style={{ color: c.color, fontSize: "24px", fontWeight: "800" }}>{c.value}</div>
              <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>{c.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}