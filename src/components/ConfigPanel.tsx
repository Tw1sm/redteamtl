import { useState } from "react";
import { parseISO, isBefore, isEqual } from "date-fns";
import type { TimelineConfig } from "../types";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
  config: TimelineConfig;
  setConfig: (config: TimelineConfig) => void;
}

export default function ConfigPanel({ config, setConfig }: ConfigPanelProps) {
  const [title, setTitle] = useState(config.title);
  const [startDate, setStartDate] = useState(config.startDate);
  const [endDate, setEndDate] = useState(config.endDate);
  const [errors, setErrors] = useState<{ dates?: string; title?: string }>({});
  const [collapsed, setCollapsed] = useState(true);

  function validate(): boolean {
    const next: { dates?: string; title?: string } = {};

    if (!title.trim()) {
      next.title = "Title is required";
    }

    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (isBefore(end, start) || isEqual(end, start)) {
        next.dates = "End date must be after start date";
      }
    }

    if (!startDate || !endDate) {
      next.dates = "Both dates are required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setConfig({
      title: title.trim(),
      startDate,
      endDate,
    });
  }

  const hasChanges =
    title !== config.title ||
    startDate !== config.startDate ||
    endDate !== config.endDate;

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className={styles.toggleIcon}>{collapsed ? "\u25b6" : "\u25bc"}</span>
        Assessment Configuration
      </button>

      {!collapsed && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Assessment Title</label>
            <input
              type="text"
              className={styles.textInput}
              value={title}
              placeholder="Assessment title..."
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <span className={styles.error}>{errors.title}</span>
            )}
          </div>

          <div className={styles.dateRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <span className={styles.dateSeparator}>&mdash;</span>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {errors.dates && (
            <span className={styles.error}>{errors.dates}</span>
          )}

          <button
            type="submit"
            className={styles.updateBtn}
            disabled={!hasChanges}
          >
            Update
          </button>
        </form>
      )}
    </div>
  );
}
