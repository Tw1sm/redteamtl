import { useRef, useState } from "react";
import { exportToJson } from "../utils/fileExport";
import { importFromJson } from "../utils/fileImport";
import { exportToPng } from "../utils/pngExport";
import type { AppState, Theme, TimelineConfig } from "../types";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  exportState: () => AppState;
  loadState: (state: AppState) => void;
  config: TimelineConfig;
  theme: Theme;
  toggleTheme: () => void;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function Toolbar({ exportState, loadState, config, theme, toggleTheme }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleExportJson() {
    try {
      exportToJson(exportState());
      showToast("JSON exported successfully", "success");
    } catch {
      showToast("Failed to export JSON", "error");
    }
  }

  async function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const state = await importFromJson(file);
      loadState(state);
      showToast("Timeline imported successfully", "success");
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : "Failed to import JSON";
      showToast(msg, "error");
    }

    /*  Reset so the same file can be re-selected  */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleExportPng() {
    try {
      await exportToPng(config);
      showToast("PNG exported successfully", "success");
    } catch {
      showToast("Failed to export PNG", "error");
    }
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={handleExportJson}
          title="Export timeline as JSON"
        >
          Export JSON
        </button>

        <button
          className={styles.button}
          onClick={() => fileInputRef.current?.click()}
          title="Import timeline from JSON"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className={styles.hiddenInput}
          tabIndex={-1}
        />

        <button
          className={styles.button}
          onClick={handleExportPng}
          title="Export timeline as PNG image"
        >
          Export PNG
        </button>

        <button
          className={styles.button}
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "\u2600 Light" : "\u263e Dark"}
        </button>
      </div>

      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : styles.toastSuccess
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
