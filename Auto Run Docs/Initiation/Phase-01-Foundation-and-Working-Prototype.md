# Phase 01: Foundation & Working Prototype

This phase sets up the entire project from scratch — a Dockerized single-page web app for red team timeline reporting. By the end, a working React app will be running in Docker, displaying a horizontal timeline bar with hardcoded sample events (red flags above, blue flags below). This gives us the visual core of the application and proves the full stack works end-to-end before we add interactivity.

## Tasks

- [x] Initialize the project with Vite + React + TypeScript:
  - Run `npm create vite@latest` to scaffold a React + TypeScript project in the repo root (project name: `redteamtl`)
  - Move the scaffolded files into the repo root (not a nested folder) so `package.json` lives at `/Users/matt/projects/redteamtl/package.json`
  - Install dependencies: `npm install`
  - Verify the dev server starts with `npm run dev` (then stop it)

- [x] Install project dependencies needed for the timeline tool:
  - `npm install date-fns` for date math (week calculations, formatting)
  - `npm install html-to-image` for full-timeline PNG export (used in a later phase)
  - `npm install uuid` and `npm install -D @types/uuid` for generating event IDs
  - Verify the app still builds cleanly with `npm run build`

- [x] Create the core data model and types in `src/types.ts`:
  - `TimelineEvent` interface with fields: `id` (string), `date` (string, ISO format), `team` ("red" | "blue"), `description` (string)
  - `TimelineConfig` interface with fields: `startDate` (string), `endDate` (string), `title` (string)
  - `AppState` interface with fields: `config` (TimelineConfig), `events` (TimelineEvent[])
  - Export all types

- [x] Create the state management layer in `src/state/`:
  - `src/state/useTimelineState.ts` — a custom React hook using `useState` that manages the full `AppState`
  - Expose functions: `addEvent`, `updateEvent`, `deleteEvent`, `setConfig`, `setEvents`, `loadState`, `exportState`
  - `addEvent` should auto-generate an `id` using `uuid`
  - `loadState` accepts an `AppState` object (for JSON import)
  - `exportState` returns the current `AppState` as a serializable object
  - Initialize with a default config: title "Red Team Assessment", startDate and endDate covering a 4-week span starting from today
  - Initialize with sample hardcoded events (3 red team, 2 blue team) spread across the date range so the timeline looks populated on first load

- [x] Build the Timeline visualization component in `src/components/Timeline.tsx`:
  - Accepts props: `config: TimelineConfig`, `events: TimelineEvent[]`, `onEventClick?: (event: TimelineEvent) => void`
  - Renders a horizontal bar (slim, ~8px tall, dark gray) spanning the full width of a scrollable container
  - Calculates weekly sections from `config.startDate` to `config.endDate` using `date-fns`
  - Renders small tick marks on the bar at each week boundary with labels below the bar ("Week 1", "Week 2", etc.) and date ranges
  - Positions events horizontally based on their date relative to the overall timeline span
  - Red team events render as small red flag icons/markers ABOVE the bar with their description as a label
  - Blue team events render as small blue flag icons/markers BELOW the bar with their description as a label
  - Events on the same date stack vertically (red ones stack upward, blue ones stack downward)
  - Descriptions are positioned so they don't visually overlap flags further along the timeline (use angled or offset text if needed)
  - The entire timeline is wrapped in a `div` with `id="timeline-capture"` for PNG export later
  - Use inline styles or a CSS module (`Timeline.module.css`) — keep styling self-contained

- [x] Build the main App shell and integrate components:
  - Replace the default `src/App.tsx` with the application layout
  - Add a header with the app title "Red Team Timeline" and a subtitle showing the assessment date range
  - Render the `Timeline` component with the state from `useTimelineState`
  - The timeline should be horizontally scrollable if it overflows the viewport
  - Replace `src/App.css` with global styles: dark background (#1a1a2e or similar), light text, clean sans-serif font
  - Replace `src/index.css` with minimal reset styles (box-sizing, margin/padding reset)
  - Clean up unused Vite boilerplate files (logo SVGs, counter components, etc.)

- [x] Create the Dockerfile and docker-compose.yml for local deployment:
  - `Dockerfile` at repo root: multi-stage build — Node for building, Nginx for serving
    - Stage 1: `node:20-alpine`, copy package files, `npm ci`, copy source, `npm run build`
    - Stage 2: `nginx:alpine`, copy built files from stage 1 to `/usr/share/nginx/html`
    - Expose port 80
  - `docker-compose.yml` at repo root: single service `redteamtl`, build from `.`, map port `8080:80`
  - Add a `.dockerignore` file excluding `node_modules`, `.git`, `Auto Run Docs`
  - *Completed: Created all three files (Dockerfile, docker-compose.yml, .dockerignore) at repo root.*

- [x] Build and run the Docker container to verify everything works:
  - Run `docker compose build`
  - Run `docker compose up -d`
  - Verify the app is accessible at `http://localhost:8080` by curling it
  - Verify the response contains the app HTML
  - Run `docker compose down` to stop the container
  - If any step fails, fix the issue and retry
  - *Completed: Docker image built successfully (multi-stage build with Node 20 + Nginx). Container started and served the app at localhost:8080. Curl confirmed HTML response containing the React app shell with bundled JS/CSS assets. Container stopped cleanly.*
