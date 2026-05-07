import { motion } from "framer-motion";

function getColor(value) {
  if (value > 80) return "#ef4444";
  if (value > 60) return "#f59e0b";
  return "#22c55e";
}

export default function MetricCard({ title, value, unit = "%" }) {
  const color = getColor(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${color}55`,
        borderRadius: "16px",
        padding: "28px",
        backdropFilter: "blur(10px)",
        textAlign: "center",
      }}
    >
      <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>{title}</p>
      <p style={{ color, fontSize: "52px", fontWeight: "700", margin: 0, lineHeight: 1 }}>
        {value}<span style={{ fontSize: "20px", marginLeft: "4px" }}>{unit}</span>
      </p>
    </motion.div>
  );
}