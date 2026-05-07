import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const API = "https://localhost:8443/api/auth";

function authFetch(url, opts = {}) {
  const token = localStorage.getItem("flux-token");
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
}

export default function Profile({ user, onLogout }) {
  const { theme } = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginTime = localStorage.getItem("flux-login-time") || "This session";
  const token = localStorage.getItem("flux-token");

  const changePassword = async () => {
    if (newPassword.length < 6) { setStatus({ type: "error", msg: "Password must be at least 6 characters" }); return; }
    if (newPassword !== confirmPassword) { setStatus({ type: "error", msg: "Passwords don't match" }); return; }
    setLoading(true);
    try {
      const res = await authFetch(`${API}/change-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setStatus({ type: "success", msg: "Password changed! Please sign in again." });
        setNewPassword(""); setConfirmPassword("");
        setTimeout(onLogout, 2000);
      } else {
        setStatus({ type: "error", msg: "Failed to change password" });
      }
    } catch {
      setStatus({ type: "error", msg: "Backend unreachable" });
    }
    setLoading(false);
  };

  const card = { background: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: "20px" };
  const sectionHeader = { padding: "14px 20px", background: theme.bgCardHover, borderBottom: `1px solid ${theme.border}` };

  return (
    <div style={{ padding: "40px", color: theme.text, maxWidth: "700px" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>👤 My Profile</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Manage your account</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ ...card, display: "flex", alignItems: "center", gap: "20px", padding: "24px" }}>
        <motion.div whileHover={{ scale: 1.05 }} animate={{ boxShadow: ["0 0 0 0 rgba(99,102,241,0)", "0 0 0 8px rgba(99,102,241,0.15)", "0 0 0 0 rgba(99,102,241,0)"] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "800", color: "white", flexShrink: 0 }}>
          {user ? user[0].toUpperCase() : "?"}
        </motion.div>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: theme.text }}>{user}</div>
          <div style={{ fontSize: "13px", color: theme.textMuted, marginTop: "4px" }}>
            {user?.toLowerCase() === "admin" ? "👑 Administrator" : "👤 Standard User"}
          </div>
          <div style={{ fontSize: "11px", color: theme.textDim, marginTop: "4px", fontFamily: "monospace" }}>
            JWT authenticated • Session active
          </div>
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={card}>
        <div style={sectionHeader}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0, fontWeight: "600" }}>Account Information</p>
        </div>
        {[
          { label: "Username", value: user, icon: "👤" },
          { label: "Role", value: user?.toLowerCase() === "admin" ? "Administrator" : "User", icon: "🔑" },
          { label: "Auth Method", value: "JWT (JSON Web Token)", icon: "🛡" },
          { label: "Token Expires", value: "24 hours from login", icon: "⏱" },
          { label: "Database", value: "H2 File (persistent)", icon: "💾" },
        ].map((row, i) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: i < 4 ? `1px solid ${theme.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>{row.icon}</span>
              <span style={{ color: theme.textMuted, fontSize: "13px" }}>{row.label}</span>
            </div>
            <span style={{ color: theme.text, fontSize: "13px", fontWeight: "600" }}>{row.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={card}>
        <div style={sectionHeader}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0, fontWeight: "600" }}>Change Password</p>
        </div>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", color: theme.textMuted, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", background: theme.bgCardHover, border: `1px solid ${theme.border}`, color: theme.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: theme.textMuted, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", background: theme.bgCardHover, border: `1px solid ${theme.border}`, color: theme.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <AnimatePresence>
            {status && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", background: status.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: status.type === "success" ? theme.green : theme.red, border: `1px solid ${status.type === "success" ? theme.green : theme.red}44` }}>
                {status.type === "success" ? "✅ " : "⚠️ "}{status.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={changePassword} disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", background: theme.accent, border: "none", color: "white", fontWeight: "700", fontSize: "13px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ ...card, borderColor: `${theme.red}33` }}>
        <div style={{ ...sectionHeader, background: "rgba(239,68,68,0.06)", borderBottom: `1px solid ${theme.red}22` }}>
          <p style={{ color: theme.red, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0, fontWeight: "600" }}>Session</p>
        </div>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: theme.text, fontWeight: "600", margin: "0 0 4px", fontSize: "14px" }}>Sign Out</p>
            <p style={{ color: theme.textMuted, fontSize: "12px", margin: 0 }}>Clears your JWT token and returns to login</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onLogout}
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: theme.red, padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
            Sign Out
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}