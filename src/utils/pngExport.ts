import { toPng } from "html-to-image";
import { format, parseISO } from "date-fns";
import type { TimelineConfig } from "../types";

export async function exportToPng(config?: TimelineConfig): Promise<void> {
  const element = document.getElementById("timeline-capture");
  if (!element) {
    throw new Error("Timeline capture element not found");
  }

  /*  Read custom colors from CSS variables  */
  const rootStyle = getComputedStyle(document.documentElement);
  const redColor = rootStyle.getPropertyValue("--color-red-team").trim() || "#e74c3c";
  const blueColor = rootStyle.getPropertyValue("--color-blue-team").trim() || "#3498db";
  const poleColor = rootStyle.getPropertyValue("--color-flag-pole").trim() || "#222222";

  const container = element.parentElement;
  const originalOverflow = container?.style.overflow ?? "";
  const originalWidth = container?.style.width ?? "";
  const originalMinWidth = element.style.minWidth;
  const originalWidth2 = element.style.width;

  /*  Elements injected for the export capture  */
  let headerEl: HTMLDivElement | null = null;
  let legendEl: HTMLDivElement | null = null;
  let wrapperEl: HTMLDivElement | null = null;

  try {
    /*  Expand the container so the full timeline is visible  */
    if (container) {
      container.style.overflow = "visible";
      container.style.width = `${element.scrollWidth}px`;
    }
    element.style.minWidth = `${element.scrollWidth}px`;
    element.style.width = `${element.scrollWidth}px`;

    /*  Create a wrapper that holds header + timeline + legend for capture  */
    wrapperEl = document.createElement("div");
    wrapperEl.id = "png-export-wrapper";
    wrapperEl.style.cssText = [
      "background: #ffffff",
      "padding: 40px 48px 32px",
      "display: inline-block",
      "min-width: 100%",
      "font-family: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
    ].join(";");

    /*  Build title header  */
    headerEl = document.createElement("div");
    headerEl.style.cssText = [
      "margin-bottom: 24px",
      "padding-bottom: 16px",
      "border-bottom: 2px solid #e0e0e0",
    ].join(";");

    const titleLine = document.createElement("div");
    titleLine.style.cssText = [
      "font-size: 22px",
      "font-weight: 700",
      "color: #1a1a2e",
      "margin-bottom: 6px",
    ].join(";");
    titleLine.textContent = config?.title ?? "Red Team Timeline";
    headerEl.appendChild(titleLine);

    if (config) {
      const dateLine = document.createElement("div");
      dateLine.style.cssText = [
        "font-size: 14px",
        "color: #555",
      ].join(";");
      const start = format(parseISO(config.startDate), "MMM d, yyyy");
      const end = format(parseISO(config.endDate), "MMM d, yyyy");
      dateLine.textContent = `${start} — ${end}`;
      headerEl.appendChild(dateLine);
    }

    /*  Build legend  */
    legendEl = document.createElement("div");
    legendEl.style.cssText = [
      "margin-top: 20px",
      "padding-top: 16px",
      "border-top: 1px solid #e0e0e0",
      "display: flex",
      "gap: 24px",
      "align-items: center",
      "font-size: 13px",
      "color: #444",
    ].join(";");

    function createLegendItem(color: string, label: string): HTMLDivElement {
      const item = document.createElement("div");
      item.style.cssText = "display:flex;align-items:center;gap:6px";
      const flag = document.createElement("div");
      flag.style.cssText = [
        `width: 12px`,
        `height: 10px`,
        `background: ${color}`,
        `clip-path: polygon(0 0, 100% 50%, 0 100%)`,
      ].join(";");
      const text = document.createElement("span");
      text.style.cssText = `color: ${color}; font-weight: 600`;
      text.textContent = label;
      item.appendChild(flag);
      item.appendChild(text);
      return item;
    }

    legendEl.appendChild(createLegendItem(redColor, "Red Team"));
    legendEl.appendChild(createLegendItem(blueColor, "Blue Team"));

    /*  Apply light theme overrides to the timeline for capture  */
    const lightOverrides = document.createElement("style");
    lightOverrides.id = "png-export-light-theme";
    lightOverrides.textContent = `
      #png-export-wrapper #timeline-capture {
        background: #ffffff !important;
      }
      /* Bar */
      #png-export-wrapper [class*="bar"] {
        background: #ddd !important;
      }
      /* Tick marks */
      #png-export-wrapper [class*="tick"]:not([class*="Label"]):not([class*="Container"]):not([class*="day"]) {
        background: #bbb !important;
      }
      /* Day ticks */
      #png-export-wrapper [class*="dayTick"]:not([class*="Label"]) {
        background: #ccc !important;
        opacity: 0.5 !important;
      }
      /* Labels */
      #png-export-wrapper [class*="tickLabel"],
      #png-export-wrapper [class*="weekDates"] {
        color: #666 !important;
      }
      #png-export-wrapper [class*="weekName"] {
        color: #333 !important;
      }
      #png-export-wrapper [class*="dateLabelStart"],
      #png-export-wrapper [class*="dateLabelEnd"] {
        color: #333 !important;
      }
      #png-export-wrapper [class*="dayTickLabel"] {
        color: #999 !important;
      }
      /* Event labels */
      #png-export-wrapper [class*="eventLabel"] {
        background: #ffffff !important;
      }
      #png-export-wrapper [class*="eventLabelRed"] {
        color: ${redColor} !important;
      }
      #png-export-wrapper [class*="eventLabelBlue"] {
        color: ${blueColor} !important;
      }
      /* Flag poles */
      #png-export-wrapper [class*="flagPoleRed"] {
        background: ${poleColor} !important;
      }
      #png-export-wrapper [class*="flagPoleBlue"] {
        background: ${poleColor} !important;
      }
      /* Flag heads */
      #png-export-wrapper [class*="flagHeadRed"] {
        background: ${redColor} !important;
      }
      #png-export-wrapper [class*="flagHeadBlue"] {
        background: ${blueColor} !important;
      }
      /* Disable animations so events are fully visible during capture */
      #png-export-wrapper * {
        animation: none !important;
        transition: none !important;
      }
      /* Hide tooltips in export */
      #png-export-wrapper [class*="tooltip"] {
        display: none !important;
      }
      /* Overflow badges */
      #png-export-wrapper [class*="overflowBadgeRed"] {
        background: color-mix(in srgb, ${redColor} 15%, transparent) !important;
        color: ${redColor} !important;
        border-color: color-mix(in srgb, ${redColor} 40%, transparent) !important;
      }
      #png-export-wrapper [class*="overflowBadgeBlue"] {
        background: color-mix(in srgb, ${blueColor} 15%, transparent) !important;
        color: ${blueColor} !important;
        border-color: color-mix(in srgb, ${blueColor} 40%, transparent) !important;
      }
    `;
    document.head.appendChild(lightOverrides);

    /*  Assemble wrapper: header, then timeline (reparented), then legend  */
    const timelineParent = element.parentNode;
    const timelineNext = element.nextSibling;

    wrapperEl.appendChild(headerEl);
    wrapperEl.appendChild(element);
    wrapperEl.appendChild(legendEl);

    /*  Insert wrapper where the timeline was  */
    if (timelineNext) {
      timelineParent?.insertBefore(wrapperEl, timelineNext);
    } else {
      timelineParent?.appendChild(wrapperEl);
    }

    /*  Force a layout pass so dimensions are finalized  */
    wrapperEl.getBoundingClientRect();

    /*  Capture the wrapper (which includes header + timeline + legend)  */
    const dataUrl = await toPng(wrapperEl, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      width: wrapperEl.scrollWidth,
      height: wrapperEl.scrollHeight,
      style: {
        overflow: "visible",
      },
    });

    /*  Restore the DOM: move timeline back, remove wrapper and style  */
    if (timelineNext) {
      timelineParent?.insertBefore(element, timelineNext);
    } else {
      timelineParent?.appendChild(element);
    }
    wrapperEl.remove();
    lightOverrides.remove();
    wrapperEl = null;
    headerEl = null;
    legendEl = null;

    /*  Trigger download  */
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const filename = `redteam-timeline-${dateStr}.png`;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    /*  Restore original state  */
    if (container) {
      container.style.overflow = originalOverflow;
      container.style.width = originalWidth;
    }
    element.style.minWidth = originalMinWidth;
    element.style.width = originalWidth2;

    /*  Clean up injected elements if capture failed mid-way  */
    const staleStyle = document.getElementById("png-export-light-theme");
    if (staleStyle) staleStyle.remove();

    const staleWrapper = document.getElementById("png-export-wrapper");
    if (staleWrapper) {
      /*  Move timeline back before removing wrapper  */
      const timeline = document.getElementById("timeline-capture");
      if (timeline && staleWrapper.parentNode) {
        staleWrapper.parentNode.insertBefore(timeline, staleWrapper);
      }
      staleWrapper.remove();
    }
  }
}
