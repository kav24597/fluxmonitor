import { useState, useEffect } from "react";
import useWebSocket from "../hooks/useWebSocket";
import MetricCard from "./MetricCard";
import LiveChart from "./LiveChart";
import AlertBox from "./AlertBox";

const MAX_HISTORY = 20;

function getTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

export default function Dashboard() {
  const data = useWebSocket();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (data.cpu === 0 && data.memoryPercent === 0) return;
    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: getTime(),
          cpu: data.cpu,
          memory: data.memoryPercent,
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, [data]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
      padding: "40px",
      fontFamily: "'Inter', sans-serif",
      color: "white",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
          ⚡ Flux Monitor
        </h1>
        <p style={{ color: "#6b7280", marginTop: "8px" }}>
          Real-time system metrics dashboard
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        marginBottom: "32px",
      }}>
        <MetricCard title="CPU Usage" value={data.cpu} unit="%" />
        <MetricCard title="Memory Used" value={data.memoryPercent} unit="%" />
        <MetricCard
          title="RAM"
          value={`${data.memoryUsedMB} / ${data.memoryTotalMB}`}
          unit=" MB"
        />
      </div>

      {/* Charts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "24px",
      }}>
        <LiveChart history={history} dataKey="cpu" color="#6366f1" title="📈 CPU History" />
        <LiveChart history={history} dataKey="memory" color="#22c55e" title="📈 Memory History" />
      </div>

      {/* Alert */}
      {data.alert && <AlertBox message={data.alert} />}

    </div>
  );
}