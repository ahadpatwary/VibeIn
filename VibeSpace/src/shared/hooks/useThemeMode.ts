"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeMode() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = theme === "system" ? systemTheme : theme;
    setIsDark(currentTheme === "dark");
  }, [theme, systemTheme]);

  return {
    isDark,
    theme,
    setTheme,
    mounted,
    toggleTheme: () => {
      const currentTheme = theme === "system" ? systemTheme : theme;
      setTheme(currentTheme === "dark" ? "light" : "dark");
    },
  };
}
