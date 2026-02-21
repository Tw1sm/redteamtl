# Phase 04: Polish & Final Packaging

This phase refines the user experience, hardens edge cases, and ensures the tool is ready for real-world use during engagements. It addresses visual polish, responsive layout concerns for varying timeline lengths, and ensures the Docker workflow is clean and documented inline via the UI.

## Tasks

- [x] Improve timeline layout and scaling for varying assessment lengths:
  - Short assessments (1-2 weeks): ensure weekly sections are wide enough that flags and labels don't overlap
  - Long assessments (8+ weeks): ensure the timeline remains usable — consider a minimum section width so the container scrolls horizontally rather than compressing
  - Add date labels at the start and end of the timeline bar showing the full date (e.g., "Apr 1, 2025" and "May 1, 2025")
  - Add day-of-month tick marks within each week section (small, subtle, every day or every other day) for precise visual reference
  - Test with edge cases: 1-day assessment, 1-week assessment, 12-week assessment — verify layout doesn't break
  > Completed: Dynamic min-width (120px/week, min 800px) ensures short timelines have space and long ones scroll. Date labels added at both ends. Subtle day ticks with labels on 1st and 15th of each month. Edge cases handled (0-day, 1-day, 12-week). Also fixed pre-existing useMemo dependency lint warnings.

- [x] Refine flag and label rendering to avoid visual collisions:
  - When multiple events stack on the same date, ensure descriptions fan out or offset so they remain readable
  - For red team events (above the bar), descriptions should extend upward and slightly to the right
  - For blue team events (below the bar), descriptions should extend downward and slightly to the right
  - If many events cluster on the same date (4+), consider truncating visible labels and showing full details on hover/click
  - Ensure flag stems (the line connecting the flag icon to the timeline bar) are clearly visible and distinguishable between stacked events
  > Completed: Proximity-based collision detection groups events within 1.5% of timeline width into clusters (not just same-date). Labels fan out with 8px progressive horizontal offset per stack level. Clusters with 4+ events show only 3 visible flags plus a "+N more" badge that expands to a clickable panel showing all hidden events. Flag stems use progressive width (2px base, +1px per stack level) and graduated opacity for visual distinction. Stack spacing increased from 28px to 32px for breathing room. Timeline padding increased to 180px to accommodate taller stacks.

- [x] Add an event list/table view as a secondary view in `src/components/EventList.tsx`:
  - A sortable table showing all events: date, team (red/blue badge), description
  - Default sort by date ascending
  - Clicking an event in the table opens the EventEditor (same as clicking a flag)
  - A toggle in the toolbar or near the timeline to switch between "Timeline View" and "List View", or show the list below the timeline as a persistent panel
  - This gives users a quick way to review and manage events without hunting for flags on the timeline
  > Completed: Created `EventList.tsx` with a sortable table (date, team badge, description columns). Click any column header to sort asc/desc with arrow indicators. Default sort is date ascending. Clicking a row opens the EventEditor modal (same handler as timeline flags). Added a "Timeline View" / "List View" toggle above the content area in App.tsx. Selected row is highlighted. Empty state handled. All styles match the existing dark theme. Build and lint pass cleanly.

- [x] Improve the PNG export quality and presentation:
  - Before PNG capture, add a title header to the timeline capture area showing the assessment title and date range
  - Add a legend to the capture area: red flag icon = "Red Team", blue flag icon = "Blue Team"
  - Ensure the exported PNG has sufficient padding/margins so it doesn't look cropped
  - Set a white or very light background for the PNG export (better for printed reports) — this means temporarily swapping the dark theme to a light theme during capture, then restoring it
  - Test the PNG export with a populated timeline and verify the output is clear and report-ready
  > Completed: Rewrote `pngExport.ts` to dynamically inject a wrapper div around the timeline during capture. The wrapper includes: (1) a title header showing the assessment title and date range with a separator line, (2) the timeline itself with a full light-theme override via injected `<style>` targeting all dark-theme colors (bar, ticks, labels, flags, badges), (3) a legend footer with flag-shaped icons for Red Team and Blue Team. White background (#ffffff) with 40px/48px padding ensures the output is print-ready and never looks cropped. 2x pixel ratio for crisp rendering. All injected elements and styles are cleaned up after capture (including error-path cleanup in `finally`). Toolbar now receives `config` prop to pass title/dates to the export function. Tooltips hidden during export. Build and lint pass cleanly.

- [x] Style and UX cleanup pass across the entire application:
  - Consistent spacing, font sizes, and color usage throughout all components
  - Ensure all buttons have hover and active states
  - Add a subtle app icon/logo placeholder in the header (a simple SVG — a flag or timeline icon)
  - Ensure the app looks good at common viewport widths (1280px, 1440px, 1920px) — this is a desktop tool, mobile is not a priority
  - Remove any leftover Vite/React boilerplate branding or comments
  - Verify no console errors or warnings in the browser dev tools
  > Completed: (1) Consistent spacing: Added `font-family: inherit` rule for inputs/buttons globally, added flex column with `gap: 12px` to `.app-main` for uniform spacing, removed duplicate margin-bottom on `.view-toggle`. (2) Button states: Added `:active` states to ConfigPanel updateBtn, EventForm submitBtn and teamBtn hover, EventEditor saveBtn/cancelBtn/deleteBtn and teamBtn hover, App view-toggle-btn. (3) Logo: Created inline SVG flag+timeline icon in the header alongside the title, created matching `favicon.svg` replacing the dangling Vite favicon reference. (4) Viewport widths: Layout uses fluid padding with fixed-width form inputs and horizontal-scroll timeline — verified suitable for 1280/1440/1920px desktop widths. (5) Boilerplate: Replaced default Vite README.md with project-specific content, updated `index.html` title from "redteamtl" to "Red Team Timeline", replaced favicon reference from `vite.svg` to `favicon.svg`. (6) Build, lint, and TypeScript all pass cleanly with zero errors or warnings.

- [x] Final Docker build and end-to-end verification:
  - Clean rebuild: `docker compose build --no-cache`
  - Run: `docker compose up -d`
  - Curl `http://localhost:8080` and verify the app loads
  - Review the built HTML/JS files in the Docker container to ensure the bundle is reasonable in size
  - `docker compose down`
  - Verify `docker compose up -d` and `docker compose down` is all a user needs to start and stop the tool
  > Completed: Clean `docker compose build --no-cache` succeeded — multi-stage build (node:20-alpine build, nginx:alpine serve) produced a lean production image. `docker compose up -d` started the container cleanly; `curl http://localhost:8080` returned HTTP 200 with the correct HTML referencing bundled assets. All assets verified: JS bundle 258.7 KB (81.3 KB gzipped), CSS 14.6 KB (3.3 KB gzipped), favicon.svg 556 B — reasonable for a React app with date-fns, html-to-image, and uuid. `docker compose down` cleanly stopped and removed the container and network; port 8080 confirmed released. The two-command workflow (`docker compose up -d` / `docker compose down`) is all a user needs.
