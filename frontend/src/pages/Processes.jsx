import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function authFetch(url, opts = {}) {
  const token = localStorage.getItem("flux-token");
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export default function Processes() {
  const { theme } = useTheme();
  const [procs, setProcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [killing, setKilling] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optResult, setOptResult] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("cpu");
  const [error, setError] = useState(false);

  const fetchProcs = () => {
    setLoading(true); setError(false);
    authFetch("https://localhost:8443/api/processes")
      .then(r => { if (!r.ok) throw new Error("Auth failed"); return r.json(); })
      .then(d => { setProcs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => {
    fetchProcs();
    const t = setInterval(fetchProcs, 3000);
    return () => clearInterval(t);
  }, []);

  const killProc = async (pid, name) => {
    if (!window.confirm(`Kill "${name}" (PID ${pid})?\n\nThis will force-stop the process.`)) return;
    setKilling(pid);
    try {
      await authFetch(`https://localhost:8443/api/processes/${pid}`, { method: "DELETE" });
      setTimeout(fetchProcs, 500);
    } catch {}
    setKilling(null);
  };

  const optimize = async () => {
    setOptimizing(true); setOptResult(null);
    try {
      const res = await authFetch("https://localhost:8443/api/processes/optimize-memory", { method: "POST" });
      const d = await res.json();
      setOptResult(d);
    } catch { setOptResult({ status: "error", actions: ["⚠️ Backend error"] }); }
    setOptimizing(false);
  };

  const filtered = procs
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const card = { background: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}` };

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>⚙️ Process Manager</h1>
          <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>
            {loading ? "Loading..." : `${procs.length} processes running • auto-refreshes every 3s`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchProcs}
            style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>
            🔄 Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={optimize} disabled={optimizing}
            style={{ background: optimizing ? theme.textMuted : `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`, border: "none", color: "white", padding: "10px 20px", borderRadius: "10px", cursor: optimizing ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "700" }}>
            {optimizing ? "⚙️ Optimizing..." : "⚡ Optimize Memory Now"}
          </motion.button>
        </div>
      </motion.div>

      {/* Optimize result */}
      <AnimatePresence>
        {optResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ ...card, padding: "20px", marginBottom: "20px", borderColor: optResult.status === "done" ? `${theme.green}44` : `${theme.amber}44`, background: optResult.status === "done" ? "rgba(34,197,94,0.07)" : "rgba(245,158,11,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", color: optResult.status === "done" ? theme.green : theme.amber }}>
                {optResult.status === "done" ? "✅ Optimization Complete" : "⚠️ Partial"}
              </span>
              {optResult.estimatedFreedMB && <span style={{ color: theme.green, fontWeight: "700" }}>~{optResult.estimatedFreedMB} MB freed</span>}
            </div>
            {(optResult.actions || []).map((a, i) => (
              <div key={i} style={{ fontSize: "12px", color: theme.textMuted, lineHeight: "2", fontFamily: "monospace" }}>{a}</div>
            ))}
            <button onClick={() => setOptResult(null)} style={{ marginTop: "8px", fontSize: "11px", color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer" }}>✕ Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + sort */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search processes..."
          style={{ flex: 1, minWidth: "200px", padding: "10px 16px", borderRadius: "10px", background: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.text, fontSize: "13px", outline: "none" }} />
        {["cpu", "mem"].map(k => (
          <motion.button key={k} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSortBy(k)}
            style={{ padding: "10px 18px", borderRadius: "10px", border: `1px solid ${sortBy === k ? theme.accent : theme.border}`, background: sortBy === k ? `${theme.accent}22` : theme.bgCard, color: sortBy === k ? theme.accent : theme.textMuted, cursor: "pointer", fontSize: "13px", fontWeight: sortBy === k ? "700" : "400" }}>
            Sort by {k.toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ ...card, padding: "24px", color: theme.red, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "16px" }}>
          ⚠️ Cannot load processes — JWT auth may have expired. Try signing out and back in.
        </div>
      )}

      {/* Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 160px 160px 100px", gap: "12px", padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCardHover }}>
          {["PID", "PROCESS NAME", "CPU %", "MEM %", "ACTION"].map(h => (
            <span key={h} style={{ fontSize: "11px", color: theme.textMuted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600" }}>{h}</span>
          ))}
        </div>

        {loading && procs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: "28px", display: "inline-block", marginBottom: "10px" }}>⚙️</motion.div>
            <p style={{ color: theme.textMuted, fontSize: "13px" }}>Loading processes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted, fontSize: "13px" }}>
            No processes found matching "{search}"
          </div>
        ) : (
          filtered.map((proc, i) => (
            <motion.div key={proc.pid}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
              style={{ display: "grid", gridTemplateColumns: "70px 1fr 160px 160px 100px", gap: "12px", padding: "13px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${theme.border}` : "none", alignItems: "center", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = theme.bgCardHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

              <span style={{ fontSize: "11px", color: theme.textMuted, fontFamily: "monospace" }}>{proc.pid}</span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>
                  {proc.name.includes("Chrome") || proc.name.includes("chrome") ? "🌐" :
                   proc.name.includes("node") || proc.name.includes("npm") ? "🟢" :
                   proc.name.includes("java") || proc.name.includes("mvn") ? "☕" :
                   proc.name.includes("python") ? "🐍" :
                   proc.name.includes("Code") || proc.name.includes("code") ? "💻" :
                   proc.name.includes("Safari") ? "🧭" :
                   proc.name.includes("Dock") || proc.name.includes("Finder") ? "🍎" : "⚙️"}
                </span>
                <span style={{ fontSize: "13px", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: proc.cpu > 10 ? "600" : "400" }}>
                  {proc.name}
                </span>
              </div>

              {/* CPU bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: proc.cpu > 20 ? theme.red : proc.cpu > 10 ? theme.amber : theme.green }}>{proc.cpu}%</span>
                </div>
                <div style={{ height: "5px", background: theme.border, borderRadius: "3px", overflow: "hidden" }}>
                  <motion.div animate={{ width: `${Math.min(proc.cpu * 3, 100)}%` }} transition={{ duration: 0.4 }}
                    style={{ height: "100%", borderRadius: "3px", background: proc.cpu > 20 ? theme.red : proc.cpu > 10 ? theme.amber : theme.accent }} />
                </div>
              </div>

              {/* MEM bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: proc.mem > 5 ? theme.amber : theme.green }}>{proc.mem}%</span>
                </div>
                <div style={{ height: "5px", background: theme.border, borderRadius: "3px", overflow: "hidden" }}>
                  <motion.div animate={{ width: `${Math.min(proc.mem * 10, 100)}%` }} transition={{ duration: 0.4 }}
                    style={{ height: "100%", borderRadius: "3px", background: proc.mem > 5 ? theme.amber : theme.green }} />
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => killProc(proc.pid, proc.name)} disabled={killing === proc.pid}
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: theme.red, padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontWeight: "700", opacity: killing === proc.pid ? 0.5 : 1 }}>
                {killing === proc.pid ? "..." : "🗑 Kill"}
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}