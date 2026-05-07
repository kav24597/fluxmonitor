import { motion } from "framer-motion";

export default function AlertBox({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: "rgba(239,68,68,0.1)",
        border: "1px solid #ef4444",
        borderRadius: "12px",
        padding: "16px 24px",
        color: "#ef4444",
        fontWeight: "600",
        fontSize: "15px",
        marginTop: "24px",
      }}
    >
      {message}
    </motion.div>
  );
}