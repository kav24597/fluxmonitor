import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, isDark, toggle } = useTheme();

  const Row = ({ label, desc, children }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: `1px solid ${theme.border}` }}>
      <div>
        <p style={{ color: theme.text, fontSize: "14px", fontWeight: "500", margin: 0 }}>{label}</p>
        <p style={{ color: theme.textMuted, fontSize: "12px", margin: "2px 0 0" }}>{desc}</p>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <div onClick={onChange} style={{ width: "44px", height: "24px", borderRadius: "12px", background: value ? theme.accent : theme.border, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
      <motion.div animate={{ left: value ? "22px" : "2px" }} style={{ position: "absolute", top: "2px", width: "20px", height: "20px", borderRadius: "50%", background: "white" }} />
    </div>
  );

  return (
    <div style={{ padding: "40px", color: theme.text }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>Settings</h1>
        <p style={{ color: theme.textMuted, marginTop: "6px", fontSize: "13px" }}>Preferences and configuration</p>
      </motion.div>

      <div style={{ background: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCardHover }}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>Appearance</p>
        </div>
        <Row label="Dark Mode" desc="Toggle between dark and light theme"><Toggle value={isDark} onChange={toggle} /></Row>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCardHover }}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>Backend</p>
        </div>
        <Row label="Backend URL" desc="Spring Boot server address">
          <span style={{ fontSize: "12px", color: theme.accent, fontFamily: "monospace" }}>localhost:8080</span>
        </Row>
        <Row label="Refresh Rate" desc="WebSocket push interval">
          <span style={{ fontSize: "12px", color: theme.green }}>2 seconds</span>
        </Row>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCardHover }}>
          <p style={{ color: theme.textMuted, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>About</p>
        </div>
        <Row label="Version" desc="FluxMonitor build"><span style={{ fontSize: "12px", color: theme.textMuted }}>v1.0.0</span></Row>
        <Row label="Stack" desc="Technologies used"><span style={{ fontSize: "12px", color: theme.textMuted }}>Spring Boot 3.5 + React + Vite</span></Row>
      </div>
    </div>
  );
}