import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const nav = [
  { path: "/", icon: "◈", label: "Dashboard", emoji: "🖥" },
  { path: "/analytics", icon: "◉", label: "Analytics", emoji: "📊" },
  { path: "/processes", icon: "⊞", label: "Processes", emoji: "⚙️" },
  { path: "/cleanup", icon: "◎", label: "Cleanup", emoji: "🧹" },
  { path: "/alerts", icon: "◬", label: "Alerts", emoji: "🔔" },
  { path: "/system", icon: "◫", label: "System Info", emoji: "💻" },
  { path: "/logs", icon: "▤", label: "Live Logs", emoji: "📋" },
  { path: "/settings", icon: "◧", label: "Settings", emoji: "⚙" },
  { path: "/network", icon: "🌐", label: "Network", emoji: "🌐" },
];

export default function Sidebar({ liveData, user, onLogout }) {
  const { isDark, toggle, theme } = useTheme();

  const sb = {
    bg: isDark ? "#0b0e14" : "#1e1b4b",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
    text: "rgba(255,255,255,0.45)",
    textActive: "#a5b4fc",
    activeBg: "rgba(99,102,241,0.22)",
    activeBorder: "rgba(99,102,241,0.35)",
    barBg: "rgba(255,255,255,0.07)",
  };

  return (
    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      style={{ width: "220px", minHeight: "100vh", flexShrink: 0, background: sb.bg, borderRight: `1px solid ${sb.border}`, display: "flex", flexDirection: "column", padding: "24px 0", position: "sticky", top: 0, height: "100vh" }}>

      {/* Logo */}
      <div style={{ padding: "0 20px 28px" }}>
        <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "-0.5px", color: "white" }}>
          ⚡ Flux<span style={{ color: "#818cf8" }}>Monitor</span>
        </motion.div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
          <motion.div animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Live • macOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {nav.map((item, i) => (
          <motion.div key={item.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <NavLink to={item.path} end={item.path === "/"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px",
                textDecoration: "none",
                background: isActive ? sb.activeBg : "transparent",
                border: isActive ? `1px solid ${sb.activeBorder}` : "1px solid transparent",
                color: isActive ? sb.textActive : sb.text,
                fontSize: "13px", fontWeight: isActive ? "600" : "400",
                transition: "all 0.18s",
              })}>
              <span style={{ fontSize: "16px" }}>{item.emoji}</span>
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Live bars */}
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${sb.border}` }}>
        {[
          { label: "CPU", val: liveData.cpu || 0, color: (liveData.cpu || 0) > 80 ? "#ef4444" : "#6366f1" },
          { label: "RAM", val: liveData.memoryPercent || 0, color: (liveData.memoryPercent || 0) > 85 ? "#ef4444" : "#22c55e" },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
              <span style={{ fontSize: "10px", color: s.color, fontWeight: "600" }}>{s.val}%</span>
            </div>
            <div style={{ height: "3px", background: sb.barBg, borderRadius: "2px" }}>
              <motion.div animate={{ width: `${Math.min(s.val, 100)}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: "2px", background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* User + controls */}
      <div style={{ padding: "12px 14px" }}>
        {user && (
          <motion.div whileHover={{ scale: 1.02 }}
            style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "8px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0 }}>
              {user[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>
                {user.toLowerCase() === "admin" ? "👑 Admin" : "👤 User"}
              </div>
            </div>
          </motion.div>
        )}
        <div style={{ display: "flex", gap: "6px" }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggle}
            style={{ flex: 1, padding: "8px 6px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px" }}>
            {isDark ? "☀️" : "🌙"}
          </motion.button>
          {onLogout && (
            <motion.button whileHover={{ scale: 1.02, background: "rgba(239,68,68,0.25)" }} whileTap={{ scale: 0.97 }} onClick={onLogout}
              style={{ flex: 2, padding: "8px", borderRadius: "8px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>
              Sign Out
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}