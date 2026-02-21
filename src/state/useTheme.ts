import { useState, useEffect } from "react";
import type { Theme, CustomColors } from "../types";
import { DEFAULT_COLORS, DEFAULT_COLORS_DARK, DEFAULT_COLORS_LIGHT } from "../types";

interface ThemeSettings {
  theme: Theme;
  colors: CustomColors;
}

const STORAGE_KEY = "redteamtl-theme";

function defaultsForTheme(theme: Theme): CustomColors {
  return theme === "light" ? { ...DEFAULT_COLORS_LIGHT } : { ...DEFAULT_COLORS_DARK };
}

function loadSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const theme: Theme = parsed.theme === "light" ? "light" : "dark";
      return {
        theme,
        colors: { ...defaultsForTheme(theme), ...parsed.colors },
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
    setSettings((prev) => {
      const oldDefaults = defaultsForTheme(prev.theme);
      const newDefaults = defaultsForTheme(theme);
      const colors = { ...prev.colors };
      /*  Swap any color that still matches the old default to the new default  */
      for (const key of Object.keys(oldDefaults) as (keyof CustomColors)[]) {
        if (colors[key] === oldDefaults[key]) {
          colors[key] = newDefaults[key];
        }
      }
      return { theme, colors };
    });
  }

  function setColors(colors: CustomColors) {
    setSettings((prev) => ({ ...prev, colors }));
  }

  function resetColors() {
    setSettings((prev) => ({ ...prev, colors: defaultsForTheme(prev.theme) }));
  }

  return {
    theme: settings.theme,
    colors: settings.colors,
    setTheme,
    setColors,
    resetColors,
  };
}
