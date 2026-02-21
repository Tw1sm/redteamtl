import { useState, useEffect } from "react";
import type { Theme, CustomColors } from "../types";
import { DEFAULT_COLORS } from "../types";

interface ThemeSettings {
  theme: Theme;
  colors: CustomColors;
}

const STORAGE_KEY = "redteamtl-theme";

function loadSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme === "light" ? "light" : "dark",
        colors: { ...DEFAULT_COLORS, ...parsed.colors },
      };
    }
  } catch {
    /*  ignore malformed data  */
  }
  return { theme: "dark", colors: { ...DEFAULT_COLORS } };
}

function applyToDOM(settings: ThemeSettings) {
  const root = document.documentElement;
  root.setAttribute("data-theme", settings.theme);
  root.style.colorScheme = settings.theme;
  root.style.setProperty("--color-red-team", settings.colors.redTeam);
  root.style.setProperty("--color-blue-team", settings.colors.blueTeam);
  root.style.setProperty("--color-timeline-bar", settings.colors.timelineBar);
  root.style.setProperty("--color-flag-pole", settings.colors.flagPole);
}

export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings);

  useEffect(() => {
    applyToDOM(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function setTheme(theme: Theme) {
    setSettings((prev) => ({ ...prev, theme }));
  }

  function setColors(colors: CustomColors) {
    setSettings((prev) => ({ ...prev, colors }));
  }

  function resetColors() {
    setSettings((prev) => ({ ...prev, colors: { ...DEFAULT_COLORS } }));
  }

  return {
    theme: settings.theme,
    colors: settings.colors,
    setTheme,
    setColors,
    resetColors,
  };
}
