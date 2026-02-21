import { format } from "date-fns";
import type { AppState } from "../types";

export function exportToJson(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const filename = `redteam-timeline-${dateStr}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
