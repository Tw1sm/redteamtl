import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useTimelineState } from "./state/useTimelineState";
import { useTheme } from "./state/useTheme";
import Timeline from "./components/Timeline";
import ConfigPanel from "./components/ConfigPanel";
import ColorsPanel from "./components/ColorsPanel";
import EventForm from "./components/EventForm";
import EventEditor from "./components/EventEditor";
import EventList from "./components/EventList";
import Toolbar from "./components/Toolbar";
import type { TimelineEvent, AppState } from "./types";
import "./App.css";

type ViewMode = "timeline" | "list";

function App() {
  const { state, addEvent, updateEvent, deleteEvent, setConfig, loadState, exportState } =
    useTimelineState();
  const { config, events } = state;
  const { theme, colors, setTheme, setColors, resetColors } = useTheme();

  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [zoom, setZoom] = useState(2);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function handleExportState(): AppState {
    return { ...exportState(), colors };
  }

  function handleLoadState(imported: AppState) {
    if (imported.colors) {
      setColors(imported.colors);
    }
    loadState(imported);
  }

  const startFormatted = format(parseISO(config.startDate), "MMM d, yyyy");
  const endFormatted = format(parseISO(config.endDate), "MMM d, yyyy");

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-row">
          <svg
            className="app-logo"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <line x1="6" y1="4" x2="6" y2="24" stroke={colors.redTeam} strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="7,4 20,9 7,14" fill={colors.redTeam} />
            <line x1="2" y1="24" x2="26" y2="24" stroke="#444" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="24" r="1.5" fill={colors.blueTeam} />
            <circle cx="18" cy="24" r="1.5" fill={colors.redTeam} />
            <circle cx="24" cy="24" r="1.5" fill={colors.blueTeam} />
          </svg>
          <h1 className="app-title">Red Team Timeline</h1>
        </div>
        <p className="app-subtitle">
          {config.title} &mdash; {startFormatted} to {endFormatted}
        </p>
      </header>
      <Toolbar
        exportState={handleExportState}
        loadState={handleLoadState}
        config={config}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="app-main">
        <ConfigPanel config={config} setConfig={setConfig} />
        <ColorsPanel colors={colors} setColors={setColors} resetColors={resetColors} />

        <div className="view-controls">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === "timeline" ? "view-toggle-active" : ""}`}
              onClick={() => setViewMode("timeline")}
            >
              Timeline View
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "list" ? "view-toggle-active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              List View
            </button>
          </div>
          {viewMode === "timeline" && (
            <div className="zoom-control">
              <label className="zoom-label">Zoom</label>
              <input
                type="range"
                className="zoom-slider"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            </div>
          )}
        </div>

        {viewMode === "timeline" ? (
          <div className="timeline-scroll">
            <Timeline
              config={config}
              events={events}
              onEventClick={(event) => setEditingEvent(event)}
              selectedEventId={editingEvent?.id ?? null}
              zoom={zoom}
            />
          </div>
        ) : (
          <EventList
            events={events}
            onEventClick={(event) => setEditingEvent(event)}
            selectedEventId={editingEvent?.id ?? null}
          />
        )}

        <EventForm config={config} addEvent={addEvent} />
      </main>

      {editingEvent && (
        <EventEditor
          event={editingEvent}
          config={config}
          updateEvent={updateEvent}
          deleteEvent={deleteEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}

export default App;
