export interface TimelineEvent {
  id: string;
  date: string;
  team: "red" | "blue";
  description: string;
  lane: 1 | 2 | 3 | 4;
}

export interface TimelineConfig {
  startDate: string;
  endDate: string;
  title: string;
}

export interface AppState {
  config: TimelineConfig;
  events: TimelineEvent[];
  colors?: CustomColors;
}

export type Theme = "dark" | "light";

export interface CustomColors {
  redTeam: string;
  blueTeam: string;
  timelineBar: string;
  flagPole: string;
}

export const DEFAULT_COLORS_DARK: CustomColors = {
  redTeam: "#e74c3c",
  blueTeam: "#3498db",
  timelineBar: "#333333",
  flagPole: "#222222",
};

export const DEFAULT_COLORS_LIGHT: CustomColors = {
  redTeam: "#e74c3c",
  blueTeam: "#3498db",
  timelineBar: "#c2c2c2",
  flagPole: "#222222",
};

export const DEFAULT_COLORS = DEFAULT_COLORS_DARK;
