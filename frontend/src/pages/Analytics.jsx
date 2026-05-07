import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useTheme } from "../context/ThemeContext";

function getNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

export default function Analytics({ data }) {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!data.cpu) return;
    setHistory(p => {
      const n = [...p, { time: getNow(), cpu: data.cpu, memory: data.memoryPercent, combined: (data.cpu + data.memoryPercent) / 2 }];
      return n.length > 60 ? n.slice(-60) : n;
    });
  }, [data]);

  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const max = arr => arr.length ? Math.round(Math.max(...arr)) : 0;

  const cpuVals = history.map(h => h.cpu);
  const memVals = history.map(h => h.memory);

  const stats = [
    { label: "Avg CPU", value: avg(cpuVals) + "%", color: "#6366f1" },
    { label: "Peak CPU", value: max(cpuVals) + "%", color: "#ef4444" },
    { label: "Avg Memory", value: avg(memVals) + "%", color: "#22c55e" },
    { label: "Peak Memory", value: max(memVals) + "%", color: "#f59e0b" },
  ];

  const chartStyle = { background: theme.bgCard, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` };
  const ttStyle = { contentStyle: { background: theme.sidebar, border: "none", borderRadius: "10px", fontSize: "12px" }, labelStyle: { color: theme.textMuted } };

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>Analytics</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Session performance trends</p>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: theme.bgCard, borderRadius: "16px", padding: "20px", border: `1px solid ${theme.border}` }}>
            <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 8px" }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: "32px", fontWeight: "800", margin: 0 }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Combined area chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ ...chartStyle, marginBottom: "20px" }}>
        <p style={{ color: theme.textMuted, fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>CPU + Memory Over Time</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="gcpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gmem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="time" tick={{ fill: theme.textDim, fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fill: theme.textDim, fontSize: 9 }} />
            <Tooltip {...ttStyle} />
            <Legend wrapperStyle={{ fontSize: "12px", color: theme.textMuted }} />
            <Area type="monotone" dataKey="cpu" stroke="#6366f1" fill="url(#gcpu)" strokeWidth={2} dot={false} isAnimationActive={false} name="CPU %" />
            <Area type="monotone" dataKey="memory" stroke="#22c55e" fill="url(#gmem)" strokeWidth={2} dot={false} isAnimationActive={false} name="Memory %" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar chart - last 10 readings */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={chartStyle}>
        <p style={{ color: theme.textMuted, fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>Last 10 Readings</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={history.slice(-10)}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="time" tick={{ fill: theme.textDim, fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fill: theme.textDim, fontSize: 9 }} />
            <Tooltip {...ttStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="cpu" fill="#6366f1" radius={[4,4,0,0]} name="CPU %" />
            <Bar dataKey="memory" fill="#22c55e" radius={[4,4,0,0]} name="Memory %" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}