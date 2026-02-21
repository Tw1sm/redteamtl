import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import type { TimelineEvent } from "../types";
import styles from "./EventList.module.css";

type SortField = "date" | "team" | "description";
type SortDirection = "asc" | "desc";

interface EventListProps {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
  selectedEventId: string | null;
}

export default function EventList({
  events,
  onEventClick,
  selectedEventId,
}: EventListProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const sortedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = a.date.localeCompare(b.date);
      } else if (sortField === "team") {
        cmp = a.team.localeCompare(b.team);
      } else {
        cmp = a.description.localeCompare(b.description);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [events, sortField, sortDirection]);

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " \u25B2" : " \u25BC";
  };

  return (
    <div className={styles.container}>
      {events.length === 0 ? (
        <p className={styles.empty}>No events to display.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={`${styles.th} ${styles.sortable}`}
                onClick={() => handleSort("date")}
              >
                Date{sortIndicator("date")}
              </th>
              <th
                className={`${styles.th} ${styles.sortable}`}
                onClick={() => handleSort("team")}
              >
                Team{sortIndicator("team")}
              </th>
              <th
                className={`${styles.th} ${styles.sortable}`}
                onClick={() => handleSort("description")}
              >
                Description{sortIndicator("description")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((event) => (
              <tr
                key={event.id}
                className={`${styles.row} ${
                  selectedEventId === event.id ? styles.rowSelected : ""
                }`}
                onClick={() => onEventClick(event)}
              >
                <td className={styles.td}>
                  {format(parseISO(event.date), "MMM d, yyyy")}
                </td>
                <td className={styles.td}>
                  <span
                    className={`${styles.badge} ${
                      event.team === "red" ? styles.badgeRed : styles.badgeBlue
                    }`}
                  >
                    {event.team === "red" ? "Red" : "Blue"}
                  </span>
                </td>
                <td className={styles.td}>{event.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
