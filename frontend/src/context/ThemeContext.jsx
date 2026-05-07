import { createContext, useContext, useState, useEffect } from "react";
import { darkTheme, lightTheme } from "../theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("fluxmonitor-theme");
      return saved !== "light";
    } catch { return true; }
  });

  const theme = isDark ? darkTheme : lightTheme;

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem("fluxmonitor-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.body.style.background = theme.bg;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);