import { useState } from "react";
import { parseISO, isWithinInterval } from "date-fns";
import type { TimelineConfig, TimelineEvent } from "../types";
import styles from "./EventEditor.module.css";

interface EventEditorProps {
  event: TimelineEvent;
  config: TimelineConfig;
  updateEvent: (id: string, updates: Partial<Omit<TimelineEvent, "id">>) => void;
  deleteEvent: (id: string) => void;
  onClose: () => void;
}

export default function EventEditor({
  event,
  config,
  updateEvent,
  deleteEvent,
  onClose,
}: EventEditorProps) {
  const [date, setDate] = useState(event.date);
  const [team, setTeam] = useState<"red" | "blue">(event.team);
  const [description, setDescription] = useState(event.description);
  const [errors, setErrors] = useState<{ date?: string; description?: string }>(
    {}
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    updateEvent(event.id, { date, team, description: description.trim() });
    onClose();
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEvent(event.id);
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Edit Event</h2>
        <form className={styles.form} onSubmit={handleSave}>
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

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Save
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ""}`}
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
            >
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
