import { useMemo, useState } from "react";
import {
  parseISO,
  differenceInCalendarDays,
  eachWeekOfInterval,
  eachDayOfInterval,
  format,
  addDays,
} from "date-fns";
import type { TimelineConfig, TimelineEvent } from "../types.ts";
import styles from "./Timeline.module.css";

/*  Convert a calendar day to an evenly-spaced percentage position.
    Each week gets an equal share of the timeline width regardless of
    whether the first/last week is partial.  */
function dayToEvenPercent(
  day: Date,
  weekStarts: Date[],
  endDate: Date
): number {
  if (weekStarts.length === 0) return 0;
  const numWeeks = weekStarts.length;

  /*  Find which week this day falls in  */
  let weekIdx = 0;
  for (let i = weekStarts.length - 1; i >= 0; i--) {
    if (day >= weekStarts[i]) {
      weekIdx = i;
      break;
    }
  }

  /*  Calculate position within the week (0 to 1)  */
  const weekStart = weekStarts[weekIdx];
  const weekEnd =
    weekIdx < numWeeks - 1 ? weekStarts[weekIdx + 1] : addDays(endDate, 1);
  const weekDays = differenceInCalendarDays(weekEnd, weekStart);
  const dayInWeek = differenceInCalendarDays(day, weekStart);
  const fractionalPos = weekDays > 0 ? dayInWeek / weekDays : 0;

  /*  Even spacing: each week spans (100 / numWeeks)%  */
  const weekWidth = 100 / numWeeks;
  return weekIdx * weekWidth + fractionalPos * weekWidth;
}

interface TimelineProps {
  config: TimelineConfig;
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  selectedEventId?: string | null;
}

interface PositionedEvent {
  event: TimelineEvent;
  percent: number;
  stackIndex: number;
  clusterSize: number;
  truncated: boolean;
}

const CLUSTER_VISIBLE_LIMIT = 3;
const PROXIMITY_THRESHOLD_PCT = 1.5;

function getEventPositions(
  events: TimelineEvent[],
  endDate: Date,
  weekStarts: Date[]
): { red: PositionedEvent[]; blue: PositionedEvent[] } {
  const red: PositionedEvent[] = [];
  const blue: PositionedEvent[] = [];

  const sorted = [...events].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );

  const redEvents: { event: TimelineEvent; percent: number }[] = [];
  const blueEvents: { event: TimelineEvent; percent: number }[] = [];

  for (const event of sorted) {
    const percent = dayToEvenPercent(
      parseISO(event.date),
      weekStarts,
      endDate
    );
    if (event.team === "red") {
      redEvents.push({ event, percent });
    } else {
      blueEvents.push({ event, percent });
    }
  }

  function assignPositions(
    teamEvents: { event: TimelineEvent; percent: number }[]
  ): PositionedEvent[] {
    const result: PositionedEvent[] = [];

    /*  Group events that are within PROXIMITY_THRESHOLD_PCT of each other  */
    const clusters: { event: TimelineEvent; percent: number }[][] = [];
    for (const ev of teamEvents) {
      const lastCluster = clusters[clusters.length - 1];
      if (
        lastCluster &&
        Math.abs(ev.percent - lastCluster[0].percent) < PROXIMITY_THRESHOLD_PCT
      ) {
        lastCluster.push(ev);
      } else {
        clusters.push([ev]);
      }
    }

    for (const cluster of clusters) {
      const clusterSize = cluster.length;
      cluster.forEach((ev, i) => {
        result.push({
          event: ev.event,
          percent: ev.percent,
          stackIndex: i,
          clusterSize,
          truncated: clusterSize > CLUSTER_VISIBLE_LIMIT && i >= CLUSTER_VISIBLE_LIMIT,
        });
      });
    }

    return result;
  }

  red.push(...assignPositions(redEvents));
  blue.push(...assignPositions(blueEvents));

  return { red, blue };
}

function ClusterOverflow({
  team,
  count,
  percent,
  offset,
  events: clusterEvents,
  onEventClick,
}: {
  team: "red" | "blue";
  count: number;
  percent: number;
  offset: number;
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isRed = team === "red";
  const colorClass = isRed ? styles.eventRed : styles.eventBlue;

  return (
    <div
      className={`${styles.event} ${colorClass} ${styles.clusterOverflow}`}
      style={{ left: `${percent}%` }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      aria-label={`${count} more ${team} team events`}
    >
      <div
        className={`${styles.flagPole} ${isRed ? styles.flagPoleRed : styles.flagPoleBlue}`}
        style={{ height: `${offset}px`, opacity: 0.5 }}
      />
      <div
        className={`${styles.overflowBadge} ${isRed ? styles.overflowBadgeRed : styles.overflowBadgeBlue}`}
        style={isRed ? { bottom: `${offset}px` } : { top: `${offset}px` }}
      >
        +{count} more
      </div>
      {expanded && (
        <div
          className={`${styles.overflowPanel} ${isRed ? styles.overflowPanelRed : styles.overflowPanelBlue}`}
          style={isRed ? { bottom: `${offset + 24}px` } : { top: `${offset + 24}px` }}
        >
          {clusterEvents.map((ev) => (
            <div
              key={ev.id}
              className={styles.overflowItem}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(ev);
              }}
            >
              <span className={styles.overflowItemDate}>
                {format(parseISO(ev.date), "MMM d")}
              </span>
              <span className={styles.overflowItemDesc}>{ev.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Timeline({
  config,
  events,
  onEventClick,
  selectedEventId,
  zoom = 1,
}: TimelineProps & { zoom?: number }) {
  const startDate = parseISO(config.startDate);
  const endDate = parseISO(config.endDate);
  const totalDays = differenceInCalendarDays(endDate, startDate);

  const weekStarts = useMemo(() => {
    if (totalDays <= 0) return [];
    return eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    );
  }, [startDate, endDate, totalDays]);

  const weeks = useMemo(() => {
    if (weekStarts.length === 0) return [];
    const numWeeks = weekStarts.length;
    return weekStarts.map((weekStart, i) => {
      const percent = (i / numWeeks) * 100;
      const weekEnd = addDays(weekStart, 6);
      return {
        percent,
        label: `Week ${i + 1}`,
        dateRange: `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`,
      };
    });
  }, [weekStarts]);

  const dayTicks = useMemo(() => {
    if (totalDays <= 0) return [];
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    return allDays.map((day) => {
      const percent = dayToEvenPercent(day, weekStarts, endDate);
      const dayOfMonth = day.getDate();
      return { percent, dayOfMonth };
    });
  }, [startDate, endDate, totalDays, weekStarts]);

  const { red, blue } = useMemo(
    () => getEventPositions(events, endDate, weekStarts),
    [events, endDate, weekStarts]
  );

  const poleHeight = 30;
  const stackSpacing = 32;

  const BASE_PX_PER_WEEK = 120;
  const numWeeks = Math.max(1, weekStarts.length);
  const timelineWidth = Math.max(400, numWeeks * BASE_PX_PER_WEEK * zoom + 80);

  /*  Identify overflow clusters to render "+N more" badges  */
  const redOverflows = useMemo(() => {
    const overflows: {
      percent: number;
      count: number;
      offset: number;
      events: TimelineEvent[];
    }[] = [];
    const seen = new Set<string>();
    for (const p of red) {
      if (!p.truncated || seen.has(p.event.date)) continue;
      seen.add(p.event.date);
      const hidden = red.filter(
        (r) => r.truncated && r.event.date === p.event.date
      );
      const offset =
        poleHeight + CLUSTER_VISIBLE_LIMIT * stackSpacing;
      overflows.push({
        percent: p.percent,
        count: hidden.length,
        offset,
        events: hidden.map((h) => h.event),
      });
    }
    return overflows;
  }, [red, poleHeight, stackSpacing]);

  const blueOverflows = useMemo(() => {
    const overflows: {
      percent: number;
      count: number;
      offset: number;
      events: TimelineEvent[];
    }[] = [];
    const seen = new Set<string>();
    for (const p of blue) {
      if (!p.truncated || seen.has(p.event.date)) continue;
      seen.add(p.event.date);
      const hidden = blue.filter(
        (b) => b.truncated && b.event.date === p.event.date
      );
      const offset =
        poleHeight + CLUSTER_VISIBLE_LIMIT * stackSpacing;
      overflows.push({
        percent: p.percent,
        count: hidden.length,
        offset,
        events: hidden.map((h) => h.event),
      });
    }
    return overflows;
  }, [blue, poleHeight, stackSpacing]);

  function renderEvent(positioned: PositionedEvent, team: "red" | "blue") {
    if (positioned.truncated) return null;

    const lane = (positioned.event.lane ?? 1) - 1;
    const offset = poleHeight + lane * stackSpacing;
    const isSelected = selectedEventId === positioned.event.id;
    const isRed = team === "red";
    const teamClass = isRed ? styles.eventRed : styles.eventBlue;
    const poleClass = isRed ? styles.flagPoleRed : styles.flagPoleBlue;
    const headClass = isRed ? styles.flagHeadRed : styles.flagHeadBlue;
    const labelClass = isRed ? styles.eventLabelRed : styles.eventLabelBlue;
    const tooltipClass = isRed ? styles.tooltipRed : styles.tooltipBlue;

    const flagHeadHeight = 10;
    const poleStyle: React.CSSProperties = {
      height: `${offset + flagHeadHeight}px`,
    };

    return (
      <div
        key={positioned.event.id}
        className={`${styles.event} ${teamClass}${isSelected ? ` ${styles.eventSelected}` : ""}`}
        style={{ left: `${positioned.percent}%`, zIndex: 5 - lane }}
        onClick={() => onEventClick?.(positioned.event)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEventClick?.(positioned.event);
          }
        }}
        aria-label={`${positioned.event.team} team event: ${positioned.event.description}`}
      >
        <div
          className={`${styles.flagPole} ${poleClass}`}
          style={poleStyle}
        />
        <div
          className={`${styles.flagHead} ${headClass}`}
          style={isRed ? { bottom: `${offset}px` } : { top: `${offset}px` }}
        />
        <div
          className={`${styles.eventLabel} ${labelClass}`}
          style={
            isRed
              ? { bottom: `${offset - 2}px`, left: '14px' }
              : { top: `${offset - 2}px`, left: '14px' }
          }
        >
          {positioned.event.description}
        </div>
        <div
          className={`${styles.tooltip} ${tooltipClass}`}
          style={isRed ? { bottom: '24px' } : { top: '24px' }}
        >
          <div className={styles.tooltipDate}>
            {format(parseISO(positioned.event.date), "MMM d, yyyy")}
          </div>
          <div className={styles.tooltipTeam}>
            {isRed ? "Red Team" : "Blue Team"}
          </div>
          <div className={styles.tooltipDesc}>
            {positioned.event.description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div id="timeline-capture" className={styles.timeline} style={{ width: `${timelineWidth}px` }}>
        <div className={styles.bar} />

        <div className={styles.ticksContainer}>
          {dayTicks.map((dt, i) => (
            <div
              key={`day-${i}`}
              className={styles.dayTick}
              style={{ left: `${dt.percent}%` }}
            >
              {dt.dayOfMonth === 1 || dt.dayOfMonth === 15 ? (
                <span className={styles.dayTickLabel}>{dt.dayOfMonth}</span>
              ) : null}
            </div>
          ))}
          {weeks.map((week, i) => (
            <div key={i}>
              <div
                className={styles.tick}
                style={{ left: `${week.percent}%` }}
              />
              <div
                className={styles.tickLabel}
                style={{ left: `${week.percent}%` }}
              >
                <div className={styles.weekName}>{week.label}</div>
                <div className={styles.weekDates}>{week.dateRange}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.eventsContainer}>
          {[...red].sort((a, b) => (b.event.lane ?? 1) - (a.event.lane ?? 1)).map((p) => renderEvent(p, "red"))}
          {redOverflows.map((ov, i) => (
            <ClusterOverflow
              key={`red-overflow-${i}`}
              team="red"
              count={ov.count}
              percent={ov.percent}
              offset={ov.offset}
              events={ov.events}
              onEventClick={onEventClick}
            />
          ))}
          {[...blue].sort((a, b) => (b.event.lane ?? 1) - (a.event.lane ?? 1)).map((p) => renderEvent(p, "blue"))}
          {blueOverflows.map((ov, i) => (
            <ClusterOverflow
              key={`blue-overflow-${i}`}
              team="blue"
              count={ov.count}
              percent={ov.percent}
              offset={ov.offset}
              events={ov.events}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
