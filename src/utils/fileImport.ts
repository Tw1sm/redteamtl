import { v4 as uuidv4 } from "uuid";
import { parseISO, isValid } from "date-fns";
import type { AppState, TimelineEvent } from "../types";
import { DEFAULT_COLORS } from "../types";

function isValidISODate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const parsed = parseISO(value);
  return isValid(parsed);
}

function validateEvent(
  event: unknown,
  index: number
): TimelineEvent {
  if (typeof event !== "object" || event === null) {
    throw new Error(`Event at index ${index} is not an object`);
  }

  const e = event as Record<string, unknown>;

  if (!isValidISODate(e.date)) {
    throw new Error(
      `Event at index ${index}: "date" must be a valid ISO date string`
    );
  }

  if (e.team !== "red" && e.team !== "blue") {
    throw new Error(
      `Event at index ${index}: "team" must be "red" or "blue"`
    );
  }

  if (typeof e.description !== "string" || e.description.trim() === "") {
    throw new Error(
      `Event at index ${index}: "description" must be a non-empty string`
    );
  }

  const id = typeof e.id === "string" && e.id.trim() !== ""
    ? e.id
    : uuidv4();

  const lane = (e.lane === 1 || e.lane === 2 || e.lane === 3 || e.lane === 4)
    ? e.lane
    : 1;

  return {
    id,
    date: e.date as string,
    team: e.team as "red" | "blue",
    description: e.description as string,
    lane,
  };
}

export function importFromJson(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text);

        if (typeof data !== "object" || data === null) {
          throw new Error("JSON root must be an object");
        }

        if (typeof data.config !== "object" || data.config === null) {
          throw new Error('Missing or invalid "config" object');
        }

        const { config } = data;

        if (typeof config.title !== "string" || config.title.trim() === "") {
          throw new Error('config.title must be a non-empty string');
        }

        if (!isValidISODate(config.startDate)) {
          throw new Error(
            'config.startDate must be a valid ISO date string'
          );
        }

        if (!isValidISODate(config.endDate)) {
          throw new Error(
            'config.endDate must be a valid ISO date string'
          );
        }

        if (!Array.isArray(data.events)) {
          throw new Error('"events" must be an array');
        }

        const events: TimelineEvent[] = data.events.map(
          (event: unknown, i: number) => validateEvent(event, i)
        );

        const result: AppState = {
          config: {
            title: config.title,
            startDate: config.startDate,
            endDate: config.endDate,
          },
          events,
        };

        if (typeof data.colors === "object" && data.colors !== null) {
          const c = data.colors as Record<string, unknown>;
          const isHex = (v: unknown): v is string =>
            typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v);
          result.colors = {
            redTeam: isHex(c.redTeam) ? c.redTeam : DEFAULT_COLORS.redTeam,
            blueTeam: isHex(c.blueTeam) ? c.blueTeam : DEFAULT_COLORS.blueTeam,
            redLabel: isHex(c.redLabel) ? c.redLabel : DEFAULT_COLORS.redLabel,
            blueLabel: isHex(c.blueLabel) ? c.blueLabel : DEFAULT_COLORS.blueLabel,
            timelineBar: isHex(c.timelineBar) ? c.timelineBar : DEFAULT_COLORS.timelineBar,
            flagPole: isHex(c.flagPole) ? c.flagPole : DEFAULT_COLORS.flagPole,
          };
        }

        resolve(result);
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Failed to parse JSON file")
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
