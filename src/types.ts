export interface TimelineEvent {
  id: string;
  date: string;
  team: "red" | "blue";
  description: string;
}

export interface TimelineConfig {
  startDate: string;
  endDate: string;
  title: string;
}

export interface AppState {
  config: TimelineConfig;
  events: TimelineEvent[];
}

export type Theme = "dark" | "light";

export interface CustomColors {
  redTeam: string;
  blueTeam: string;
  timelineBar: string;
  flagPole: string;
}

export const DEFAULT_COLORS: CustomColors = {
  redTeam: "#e74c3c",
  blueTeam: "#3498db",
  timelineBar: "#333333",
  flagPole: "#222222",
};
