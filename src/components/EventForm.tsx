import { useState } from "react";
import { parseISO, isWithinInterval } from "date-fns";
import type { TimelineConfig, TimelineEvent } from "../types";
import styles from "./EventForm.module.css";

interface EventFormProps {
  config: TimelineConfig;
  addEvent: (event: Omit<TimelineEvent, "id">) => void;
}

export default function EventForm({ config, addEvent }: EventFormProps) {
  const [date, setDate] = useState("");
  const [team, setTeam] = useState<"red" | "blue">("red");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ date?: string; description?: string }>(
    {}
  );

  function validate(): boolean {
    const next: { date?: string; description?: string } = {};

    if (!date) {
      next.date = "Date is required";
    } else {
      const parsed = parseISO(date);
      const start = parseISO(config.startDate);
      const end = parseISO(config.endDate);
      if (!isWithinInterval(parsed, { start, end })) {
        next.date = "Date must be within the assessment range";
      }
    }

    if (!description.trim()) {
      next.description = "Description is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    addEvent({ date, team, description: description.trim() });
    setDate("");
    setDescription("");
    setErrors({});
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Date</label>
        <input
          type="date"
          className={styles.dateInput}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={config.startDate}
          max={config.endDate}
        />
        {errors.date && <span className={styles.error}>{errors.date}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Team</label>
        <div className={styles.teamToggle}>
          <button
            type="button"
            className={`${styles.teamBtn} ${team === "red" ? styles.teamBtnRed : ""}`}
            onClick={() => setTeam("red")}
          >
            Red
          </button>
          <button
            type="button"
            className={`${styles.teamBtn} ${team === "blue" ? styles.teamBtnBlue : ""}`}
            onClick={() => setTeam("blue")}
          >
            Blue
          </button>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Description</label>
        <input
          type="text"
          className={styles.descInput}
          value={description}
          placeholder="Event description..."
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <span className={styles.error}>{errors.description}</span>
        )}
      </div>

      <button type="submit" className={styles.submitBtn}>
        Add Event
      </button>
    </form>
  );
}
