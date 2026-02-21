import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { addWeeks, format } from "date-fns";
import type { AppState, TimelineEvent, TimelineConfig } from "../types";

function createDefaultState(): AppState {
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addWeeks(today, 4), "yyyy-MM-dd");

  const week1 = format(addWeeks(today, 0), "yyyy-MM-dd");
  const week2 = format(addWeeks(today, 1), "yyyy-MM-dd");
  const week3 = format(addWeeks(today, 2), "yyyy-MM-dd");
  const week4 = format(addWeeks(today, 3), "yyyy-MM-dd");

  return {
    config: {
      title: "Red Team Assessment",
      startDate,
      endDate,
    },
    events: [
      {
        id: uuidv4(),
        date: week1,
        team: "red",
        description: "Initial recon & OSINT",
      },
      {
        id: uuidv4(),
        date: week2,
        team: "red",
        description: "Phishing campaign launched",
      },
      {
        id: uuidv4(),
        date: week3,
        team: "red",
        description: "Lateral movement achieved",
      },
      {
        id: uuidv4(),
        date: week2,
        team: "blue",
        description: "Suspicious login detected",
      },
      {
        id: uuidv4(),
        date: week4,
        team: "blue",
        description: "Incident response initiated",
      },
    ],
  };
}

export function useTimelineState() {
  const [state, setState] = useState<AppState>(createDefaultState);

  function addEvent(event: Omit<TimelineEvent, "id">) {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { ...event, id: uuidv4() }],
    }));
  }

  function updateEvent(id: string, updates: Partial<Omit<TimelineEvent, "id">>) {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }

  function deleteEvent(id: string) {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  }

  function setConfig(config: TimelineConfig) {
    setState((prev) => ({ ...prev, config }));
  }

  function setEvents(events: TimelineEvent[]) {
    setState((prev) => ({ ...prev, events }));
  }

  function loadState(newState: AppState) {
    setState(newState);
  }

  function exportState(): AppState {
    return structuredClone(state);
  }

  return {
    state,
    addEvent,
    updateEvent,
    deleteEvent,
    setConfig,
    setEvents,
    loadState,
    exportState,
  };
}
