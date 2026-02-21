import { useState } from "react";
import type { CustomColors } from "../types";
import styles from "./ColorsPanel.module.css";

interface ColorsPanelProps {
  colors: CustomColors;
  setColors: (colors: CustomColors) => void;
  resetColors: () => void;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.colorRow}>
        <input
          type="color"
          className={styles.colorInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className={styles.hexInput}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={7}
        />
      </div>
    </div>
  );
}

export default function ColorsPanel({
  colors,
  setColors,
  resetColors,
}: ColorsPanelProps) {
  const [collapsed, setCollapsed] = useState(true);

  function update(key: keyof CustomColors, value: string) {
    setColors({ ...colors, [key]: value });
  }

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className={styles.toggleIcon}>
          {collapsed ? "\u25b6" : "\u25bc"}
        </span>
        Colors
      </button>

      {!collapsed && (
        <div className={styles.content}>
          <ColorField
            label="Red Team"
            value={colors.redTeam}
            onChange={(v) => update("redTeam", v)}
          />
          <ColorField
            label="Blue Team"
            value={colors.blueTeam}
            onChange={(v) => update("blueTeam", v)}
          />
          <ColorField
            label="Timeline Bar"
            value={colors.timelineBar}
            onChange={(v) => update("timelineBar", v)}
          />
          <ColorField
            label="Flag Pole"
            value={colors.flagPole}
            onChange={(v) => update("flagPole", v)}
          />
          <button
            type="button"
            className={styles.resetBtn}
            onClick={resetColors}
          >
            Reset Defaults
          </button>
        </div>
      )}
    </div>
  );
}
