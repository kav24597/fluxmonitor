import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../context/ThemeContext";

function getNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

export default function NetworkMonitor() {
  const { theme } = useTheme();
  const [ping, setPing] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("checking");
  const [sites, setSites] = useState([
    { name: "Google", url: "https://www.google.com", status: "unknown", ping: null },
    { name: "GitHub", url: "https://github.com", status: "unknown", ping: null },
    { name: "Cloudflare", url: "https://1.1.1.1", status: "unknown", ping: null },
    { name: "YouTube", url: "https://www.youtube.com", status: "unknown", ping: null },
  ]);

  const checkPing = async () => {
    const start = Date.now();
    try {
      await fetch("http://localhost:8080/api/auth/verify", {
        method: "GET", headers: { Authorization: `Bearer ${localStorage.getItem("flux-token")}` }
      });
      const ms = Date.now() - start;
      setPing(ms);
      setStatus(ms < 50 ? "excellent" : ms < 150 ? "good" : ms < 300 ? "fair" : "poor");
      setHistory(p => {
        const n = [...p, { time: getNow(), ping: ms }];
        return n.length > 30 ? n.slice(-30) : n;
      });
    } catch { setStatus("offline"); }
  };

  const checkSites = async () => {
    const updated = await Promise.all(sites.map(async site => {
      const start = Date.now();
      try {
        await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(site.url)}`, { signal: AbortSignal.timeout(5000) });
        return { ...site, status: "online", ping: Date.now() - start };
      } catch { return { ...site, status: "offline", ping: null }; }
    }));
    setSites(updated);
  };

  useEffect(() => {
    checkPing();
    checkSites();
    const t1 = setInterval(checkPing, 2000);
    const t2 = setInterval(checkSites, 10000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const statusColor = { excellent: theme.green, good: "#22d3ee", fair: theme.amber, poor: theme.red, offline: theme.red, checking: theme.textMuted, unknown: theme.textMuted };
  const statusLabel = { excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor", offline: "Offline", checking: "Checking...", unknown: "Unknown" };
  const card = { background: theme.bgCard, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` };

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>🌐 Network Monitor</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Real-time backend latency and connectivity</p>
      </motion.div>

      {/* Ping hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Backend Ping", value: ping ? `${ping}ms` : "—", icon: "📡", color: statusColor[status] },
          { label: "Connection", value: statusLabel[status], icon: "🔗", color: statusColor[status] },
          { label: "Avg Ping", value: history.length > 0 ? `${Math.round(history.reduce((a,b) => a+b.ping,0)/history.length)}ms` : "—", icon: "📊", color: theme.accent },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ ...card, textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{s.icon}</div>
            <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: "28px", fontWeight: "800", margin: 0 }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Ping chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ ...card, marginBottom: "24px" }}>
        <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px", fontWeight: "600" }}>
          Backend Latency History
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="pingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: theme.textMuted, fontSize: 9 }} />
            <YAxis tick={{ fill: theme.textMuted, fontSize: 9 }} />
            <Tooltip contentStyle={{ background: "#0d1117", border: "none", borderRadius: "10px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="ping" stroke="#6366f1" fill="url(#pingGrad)" strokeWidth={2} dot={false} isAnimationActive={false} name="Ping (ms)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Site status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0, fontWeight: "600" }}>
            External Connectivity
          </p>
          <motion.button whileHover={{ scale: 1.05 }} onClick={checkSites}
            style={{ background: theme.bgCardHover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            🔄 Recheck
          </motion.button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sites.map((site, i) => (
            <motion.div key={site.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: theme.bgCardHover, border: `1px solid ${theme.border}` }}>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                style={{ width: 10, height: 10, borderRadius: "50%", background: site.status === "online" ? theme.green : site.status === "offline" ? theme.red : theme.textMuted, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", fontSize: "14px", color: theme.text }}>{site.name}</div>
                <div style={{ fontSize: "11px", color: theme.textMuted }}>{site.url}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", fontSize: "14px", color: site.status === "online" ? theme.green : theme.red }}>
                  {site.status === "online" ? `${site.ping}ms` : site.status === "offline" ? "Offline" : "—"}
                </div>
                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px", textTransform: "capitalize" }}>{site.status}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}