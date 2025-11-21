import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "faan_theme";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const getPreferred = (): Theme => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
        return "dark";
    } catch {
      // ignore
    }
    return "light";
  };

  const [theme, setThemeState] = useState<Theme>(() => getPreferred());

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "");
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  const setTheme = (t: Theme) => setThemeState(t);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;


