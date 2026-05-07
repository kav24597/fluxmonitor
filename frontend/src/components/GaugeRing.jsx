import { motion } from "framer-motion";

export default function GaugeRing({ value, label, color, size = 160 }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const fill = ((value || 0) / 100) * circ;

  const glow = value > 80 ? "#ef4444" : value > 60 ? "#f59e0b" : color;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={glow}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - fill }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            transform="rotate(-90 60 60)"
            style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: "24px", fontWeight: "800", color: glow }}>{value || 0}</span>
          <span style={{ fontSize: "11px", color: "#6b7280" }}>%</span>
        </div>
      </div>
      <span style={{ fontSize: "12px", color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}