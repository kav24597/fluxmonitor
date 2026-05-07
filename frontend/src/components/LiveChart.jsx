import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function LiveChart({ history, dataKey, color, title }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
    }}>
      <p style={{ color: "#9ca3af", marginBottom: "20px", fontWeight: "600", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="time" tick={{ fill: "#374151", fontSize: 9 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#374151", fontSize: 9 }} />
          <Tooltip
            contentStyle={{ background: "#0d1117", border: `1px solid ${color}44`, borderRadius: "12px", fontSize: "12px" }}
            labelStyle={{ color: "#6b7280" }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fill={`url(#grad-${dataKey})`} dot={false} isAnimationActive={false}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}