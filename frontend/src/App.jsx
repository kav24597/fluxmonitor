import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import useWebSocket from "./hooks/useWebSocket";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Cleanup from "./pages/Cleanup";
import Alerts from "./pages/Alerts";
import SystemInfo from "./pages/SystemInfo";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Processes from "./pages/Processes";
import NetworkMonitor from "./pages/NetworkMonitor";

function BgOrbs() {
  const { theme } = useTheme();
  if (!theme.isDark) return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "-10%", right: "20%", width: 700, height: 700, borderRadius: "50%", background: "#c7d2fe", filter: "blur(130px)", opacity: 0.4 }} />
      <div style={{ position: "absolute", bottom: "0%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "#a5f3fc", filter: "blur(120px)", opacity: 0.3 }} />
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {[{ c: "#6366f1", t: "5%", l: "20%", s: 500 }, { c: "#8b5cf6", t: "65%", l: "65%", s: 350 }, { c: "#06b6d4", t: "85%", l: "5%", s: 280 }].map((o, i) => (
        <motion.div key={i} animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 7 + i * 2, repeat: Infinity }}
          style={{ position: "absolute", top: o.t, left: o.l, width: o.s, height: o.s, borderRadius: "50%", background: o.c, filter: "blur(90px)" }} />
      ))}
    </div>
  );
}

function AuthenticatedApp({ user, onLogout }) {
  const data = useWebSocket();
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg }}>
      <BgOrbs />
      <div style={{ position: "relative", zIndex: 2, display: "flex", width: "100%" }}>
        <Sidebar liveData={data} user={user} onLogout={onLogout} />
        <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/analytics" element={<Analytics data={data} />} />
            <Route path="/processes" element={<Processes />} />
            <Route path="/cleanup" element={<Cleanup data={data} />} />
            <Route path="/alerts" element={<Alerts data={data} />} />
            <Route path="/system" element={<SystemInfo />} />
            <Route path="/logs" element={<Logs data={data} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/network" element={<NetworkMonitor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppInner() {
  const [user, setUser] = useState(() => localStorage.getItem("flux-user"));
  const [token, setToken] = useState(() => localStorage.getItem("flux-token"));
  const handleLogin = (u, t) => { setUser(u); setToken(t); };
  const handleLogout = () => {
    localStorage.removeItem("flux-token");
    localStorage.removeItem("flux-user");
    setUser(null); setToken(null);
  };
  if (!user || !token) return <Login onLogin={handleLogin} />;
  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  );
}
