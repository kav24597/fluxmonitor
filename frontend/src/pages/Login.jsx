import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const API = "https://localhost:8443/api/auth";

export default function Login({ onLogin }) {
  const { theme, isDark, toggle } = useTheme();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false); // ✅ THIS WAS MISSING

  const submit = async () => {
    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Something went wrong");
        setLoading(false);
        return;
      }
      localStorage.setItem("flux-token", d.token);
      localStorage.setItem("flux-user", d.username);
      localStorage.setItem("flux-login-time", new Date().toLocaleString());
      onLogin(d.username, d.token);
    } catch {
      setError("Cannot reach backend — make sure Spring Boot is running on port 8080");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    background: theme.bgCardHover,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs — dark mode only */}
      {isDark &&
        [
          { color: "#6366f1", top: "8%", left: "12%", size: 500 },
          { color: "#8b5cf6", top: "60%", right: "8%", size: 400 },
          { color: "#06b6d4", top: "50%", left: "50%", size: 300 },
        ].map((o, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity }}
            style={{
              position: "absolute",
              top: o.top,
              left: o.left,
              right: o.right,
              width: o.size,
              height: o.size,
              borderRadius: "50%",
              background: o.color,
              filter: "blur(100px)",
              pointerEvents: "none",
            }}
          />
        ))}

      {/* Light mode orbs */}
      {!isDark && (
        <>
          <div style={{ position: "absolute", top: "-10%", right: "20%", width: 600, height: 600, borderRadius: "50%", background: "#c7d2fe", filter: "blur(120px)", opacity: 0.4, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "0%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "#a5f3fc", filter: "blur(120px)", opacity: 0.3, pointerEvents: "none" }} />
        </>
      )}

      {/* Theme toggle button */}
      <button
        onClick={toggle}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          color: theme.textMuted,
          padding: "8px 14px",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "12px",
          zIndex: 10,
        }}
      >
        {isDark ? "☀ Light" : "◑ Dark"}
      </button>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "440px",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ textAlign: "center", marginBottom: "36px" }}
        >
          <div style={{ fontSize: "56px", marginBottom: "8px" }}>⚡</div>
          <h1
            style={{
              fontSize: "34px",
              fontWeight: "900",
              color: theme.text,
              margin: 0,
              letterSpacing: "-1px",
            }}
          >
            Flux<span style={{ color: theme.accent }}>Monitor</span>
          </h1>
          <p style={{ color: theme.textMuted, marginTop: "8px", fontSize: "13px" }}>
            Real-time system intelligence platform
          </p>
        </motion.div>

        {/* Login / Register card */}
        <div
          style={{
            background: theme.bgCard,
            borderRadius: "24px",
            padding: "36px",
            border: `1px solid ${theme.border}`,
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              background: theme.bgCardHover,
              borderRadius: "14px",
              padding: "4px",
              marginBottom: "28px",
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setUsername("");
                  setPassword("");
                  setShowReset(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "11px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  transition: "all 0.2s",
                  background: mode === m ? theme.accent : "transparent",
                  color: mode === m ? "white" : theme.textMuted,
                }}
              >
                {m === "login" ? "🔑 Sign In" : "✨ Register"}
              </button>
            ))}
          </div>

          {/* Input fields */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "7px",
                }}
              >
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Enter your username"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "7px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={
                  mode === "register" ? "Min 6 characters" : "Enter password"
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0 }}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: theme.red,
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
              border: "none",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading
              ? "⚙️ Please wait..."
              : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
          </motion.button>

          {/* Forgot password — only on login tab */}
          {mode === "login" && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <span
                  onClick={() => setShowReset((p) => !p)}
                  style={{
                    fontSize: "12px",
                    color: theme.textMuted,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {showReset ? "▲ Hide" : "Forgot password?"}
                </span>
              </div>

              <AnimatePresence>
                {showReset && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: `${theme.accent}0f`,
                        border: `1px solid ${theme.accent}33`,
                        fontSize: "12px",
                        color: theme.textMuted,
                        lineHeight: "1.9",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontWeight: "700",
                          color: theme.accent,
                        }}
                      >
                        🔑 How to reset your password:
                      </p>

                      <p style={{ margin: "0 0 6px" }}>
                        <strong style={{ color: theme.text }}>
                          Option 1 — Quick:
                        </strong>{" "}
                        Register a new username. Each account is completely
                        separate.
                      </p>

                      <p style={{ margin: "0 0 8px" }}>
                        <strong style={{ color: theme.text }}>
                          Option 2 — Delete old account:
                        </strong>{" "}
                        Open the H2 database console:
                      </p>

                      <div
                        style={{
                          background: "#0d1117",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "#a5b4fc",
                          marginBottom: "8px",
                          lineHeight: "2",
                        }}
                      >
                        <div>🌐 localhost:8080/h2-console</div>
                        <div>JDBC URL: jdbc:h2:file:/Users/kavy/fluxmonitor-db</div>
                        <div>Username: sa &nbsp;&nbsp; Password: (empty)</div>
                      </div>

                      <p style={{ margin: "0 0 6px" }}>
                        Then run this SQL and register again:
                      </p>

                      <div
                        style={{
                          background: "#0d1117",
                          borderRadius: "8px",
                          padding: "8px 14px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "#f87171",
                        }}
                      >
                        DELETE FROM USERS WHERE USERNAME = 'your_username';
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Switch mode link */}
          <p
            style={{
              textAlign: "center",
              color: theme.textMuted,
              fontSize: "12px",
              marginTop: "20px",
              lineHeight: "1.8",
            }}
          >
            {mode === "login" ? "No account yet? " : "Already registered? "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setShowReset(false);
              }}
              style={{ color: theme.accent, cursor: "pointer", fontWeight: "600" }}
            >
              {mode === "login" ? "Create one" : "Sign in instead"}
            </span>
          </p>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: theme.textDim,
            fontSize: "11px",
            marginTop: "20px",
            letterSpacing: "0.5px",
          }}
        >
          Spring Boot 3.5 + React + JWT + WebSocket
        </p>
      </motion.div>
    </div>
  );
}