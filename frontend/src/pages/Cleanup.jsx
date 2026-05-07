import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function formatSize(mb) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function getToken() {
  return localStorage.getItem("flux-token");
}

function authFetch(url, opts = {}) {
  const token = getToken();
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  });
}

const SUGGESTIONS = [
  { type: "cache", icon: "🗂", label: "User Caches", desc: "~/Library/Caches — browser, app and system caches", severity: "high" },
  { type: "tmp", icon: "📁", label: "Temp Files", desc: "/tmp — auto-created temporary files", severity: "medium" },
  { type: "logs", icon: "📋", label: "System Logs", desc: "~/Library/Logs — old application log files", severity: "low" },
  { type: "trash", icon: "🗑", label: "Trash", desc: "~/.Trash — permanently empties your trash", severity: "low" },
];

const SEVERITY = {
  high: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", badge: "#ef4444", badgeText: "Critical" },
  medium: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", badge: "#f59e0b", badgeText: "Recommended" },
  low: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", badge: "#6366f1", badgeText: "Optional" },
};

export default function Cleanup({ data }) {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [cleanType, setCleanType] = useState(null);
  const [log, setLog] = useState([]);
  const [freed, setFreed] = useState(0);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => { scanFiles(); }, []);

  const scanFiles = () => {
    setLoading(true);
    authFetch("http://localhost:8080/api/large-files")
      .then(r => r.json())
      .then(d => { setFiles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(e => { console.error("File scan error:", e); setFiles([]); setLoading(false); });
  };

  const runClean = async (type) => {
    setCleaning(true); setCleanType(type); setLog([]); setShowLog(true);
    try {
      const res = await authFetch("http://localhost:8080/api/cleanup", {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      const d = await res.json();
      setLog(d.logs || ["✅ Done"]);
      setFreed(d.freedMB || 0);
      setTimeout(scanFiles, 1000);
    } catch { setLog(["⚠️ Backend error — is Spring Boot running on port 8080?"]); }
    setCleaning(false); setCleanType(null);
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    setCleaning(true); setLog([]); setShowLog(true);
    const logs = [];
    for (const path of selected) {
      try {
        const res = await authFetch("http://localhost:8080/api/delete-file", {
          method: "DELETE",
          body: JSON.stringify({ path }),
        });
        const d = await res.json();
        logs.push(d.status === "deleted" ? `✅ Deleted: ${path.split("/").pop()}` : `⚠️ Could not delete: ${path.split("/").pop()}`);
      } catch { logs.push(`❌ Error: ${path.split("/").pop()}`); }
    }
    setLog(logs);
    setFiles(prev => prev.filter(f => !selected.has(f.path)));
    setSelected(new Set());
    setCleaning(false);
  };

  const toggleFile = (path) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(path) ? n.delete(path) : n.add(path);
      return n;
    });
  };

  const card = { background: theme.bgCard, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` };

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>🧹 System Cleanup</h1>
          <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>
            Memory at{" "}
            <span style={{ color: data.memoryPercent > 80 ? theme.red : theme.green, fontWeight: "700" }}>
              {data.memoryPercent}%
            </span>
            {data.memoryPercent > 80 ? " — cleanup recommended now" : " — looking good"}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={scanFiles}
          style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>
          🔄 Rescan Files
        </motion.button>
      </motion.div>

      {/* Smart Suggestions */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px", fontWeight: "600" }}>
          Smart Suggestions
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {SUGGESTIONS.map((s, i) => {
            const st = SEVERITY[s.severity];
            const isRunning = cleaning && cleanType === s.type;
            return (
              <motion.div key={s.type} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderRadius: "14px", background: st.bg, border: `1px solid ${st.border}` }}>
                <span style={{ fontSize: "22px" }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: theme.text }}>{s.label}</div>
                  <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "2px" }}>{s.desc}</div>
                </div>
                <span style={{ fontSize: "10px", background: st.badge + "22", color: st.badge, border: `1px solid ${st.badge}44`, padding: "3px 10px", borderRadius: "20px", fontWeight: "700", whiteSpace: "nowrap" }}>
                  {st.badgeText}
                </span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => runClean(s.type)} disabled={cleaning}
                  style={{ background: isRunning ? theme.textMuted : theme.accent, border: "none", borderRadius: "10px", padding: "9px 18px", color: "white", fontSize: "12px", fontWeight: "700", cursor: cleaning ? "not-allowed" : "pointer", opacity: cleaning && !isRunning ? 0.5 : 1, whiteSpace: "nowrap" }}>
                  {isRunning ? "⚙️ Cleaning..." : "Clean"}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Clean everything button */}
        <motion.button whileHover={{ scale: 1.01, filter: "brightness(1.1)" }} whileTap={{ scale: 0.99 }}
          onClick={() => runClean("all")} disabled={cleaning}
          style={{ marginTop: "16px", width: "100%", padding: "16px", borderRadius: "14px", background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`, border: "none", color: "white", fontSize: "15px", fontWeight: "800", cursor: cleaning ? "not-allowed" : "pointer", opacity: cleaning ? 0.7 : 1, letterSpacing: "0.5px" }}>
          {cleaning && cleanType === "all" ? "⚙️ Cleaning Everything..." : "🧹 Clean Everything"}
        </motion.button>
      </div>

      {/* Cleanup log */}
      <AnimatePresence>
        {showLog && log.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
            style={{ ...card, marginBottom: "24px", borderColor: `${theme.accent}33`, background: `${theme.accent}08` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: "700", color: theme.accent, fontSize: "14px" }}>
                ✅ Cleanup Results {freed > 0 && `— ~${freed} MB freed`}
              </span>
              <button onClick={() => setShowLog(false)} style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            {log.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ fontSize: "12px", color: theme.textMuted, lineHeight: "2", fontFamily: "monospace" }}>{l}</motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Large Files */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0, fontWeight: "600" }}>
            Large Files (50MB+) {files.length > 0 && `— ${files.length} found`}
          </p>
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={deleteSelected} disabled={cleaning}
                style={{ background: theme.red, border: "none", borderRadius: "10px", padding: "9px 18px", color: "white", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                🗑 Delete {selected.size} selected file{selected.size > 1 ? "s" : ""}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div style={{ ...card, textAlign: "center", padding: "40px" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: "32px", display: "inline-block", marginBottom: "12px" }}>🔍</motion.div>
            <p style={{ color: theme.textMuted, fontSize: "13px" }}>Scanning for large files...</p>
          </div>
        ) : files.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ ...card, textAlign: "center", padding: "40px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
            <p style={{ color: theme.green, fontWeight: "700", fontSize: "16px", margin: 0 }}>No large files found</p>
            <p style={{ color: theme.textMuted, fontSize: "13px", marginTop: "6px" }}>Your system looks clean!</p>
          </motion.div>
        ) : (
          <div style={{ ...card, padding: "8px" }}>
            {/* Select all */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <input type="checkbox"
                checked={selected.size === files.length && files.length > 0}
                onChange={() => setSelected(selected.size === files.length ? new Set() : new Set(files.map(f => f.path)))}
                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: theme.accent }} />
              <span style={{ fontSize: "12px", color: theme.textMuted }}>Select all ({files.length} files)</span>
              <span style={{ marginLeft: "auto", fontSize: "12px", color: theme.textMuted }}>
                Total: {formatSize(files.reduce((a, f) => a + f.sizeMB, 0))}
              </span>
            </div>

            {files.map((f, i) => (
              <motion.div key={f.path} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => toggleFile(f.path)}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderBottom: i < files.length - 1 ? `1px solid ${theme.border}` : "none", cursor: "pointer", transition: "background 0.15s", background: selected.has(f.path) ? `${theme.red}10` : "transparent", borderRadius: i === files.length - 1 ? "0 0 12px 12px" : "0" }}
                onMouseEnter={e => !selected.has(f.path) && (e.currentTarget.style.background = theme.bgCardHover)}
                onMouseLeave={e => !selected.has(f.path) && (e.currentTarget.style.background = "transparent")}>

                <input type="checkbox" checked={selected.has(f.path)} onChange={() => toggleFile(f.path)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: theme.red, flexShrink: 0 }} />

                <span style={{ fontSize: "20px", flexShrink: 0 }}>
                  {f.name.endsWith(".zip") ? "📦" : f.name.endsWith(".dmg") ? "💿" : f.name.match(/\.(mp4|mkv|mov|avi)$/) ? "🎬" : f.name.match(/\.(jpg|png|gif)$/) ? "🖼" : "📄"}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "600", fontSize: "13px", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.folder}</div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: "800", fontSize: "14px", color: f.sizeMB > 500 ? theme.red : f.sizeMB > 200 ? theme.amber : theme.textMuted }}>
                    {formatSize(f.sizeMB)}
                  </div>
                  <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px" }}>
                    {f.sizeMB > 500 ? "🔴 Large" : f.sizeMB > 200 ? "🟡 Medium" : "🟢 Small"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}