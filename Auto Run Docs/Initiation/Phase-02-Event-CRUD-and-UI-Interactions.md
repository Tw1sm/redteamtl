# Phase 02: Event CRUD & UI Interactions

This phase adds full interactivity — users can add, edit, and delete events directly through the UI. It also introduces an assessment configuration panel so users can set the assessment date range and title. By the end of this phase, the timeline is a fully functional data entry tool.

## Tasks

- [x] Create the Add Event form component in `src/components/EventForm.tsx`:
  - A form with fields: date (date input), team (toggle or select: "red" / "blue"), description (text input, short)
  - The team selector should be visually distinct — red-highlighted when "red" is selected, blue-highlighted for "blue"
  - A submit button labeled "Add Event"
  - On submit, call the `addEvent` callback prop with the form data and clear the form
  - Validate that date is within the assessment range and description is not empty
  - Display inline validation errors
  - Style the form to match the dark theme established in Phase 01

- [x] Create the Edit Event modal/panel in `src/components/EventEditor.tsx`:
  - Accepts an existing `TimelineEvent` as a prop for pre-filling fields
  - Same fields as the Add form (date, team, description) but pre-populated
  - "Save" button to confirm edits, "Cancel" button to discard, "Delete" button to remove the event
  - The Delete button should require confirmation (a second click or a confirm prompt)
  - Call `updateEvent` or `deleteEvent` callbacks as appropriate
  - Render as a modal overlay or a slide-in panel

- [x] Create the Assessment Config panel in `src/components/ConfigPanel.tsx`:
  - Fields: assessment title (text), start date (date input), end date (date input)
  - Pre-populated with current config values
  - An "Update" button that calls `setConfig` with the new values
  - Validate that end date is after start date
  - This panel can live above the timeline or in a collapsible sidebar
  - When the date range changes, the timeline should re-render with new weekly sections

- [x] Wire up all interactive components in `src/App.tsx`:
  - Place the ConfigPanel above the timeline area
  - Place the EventForm below or beside the timeline for quick event entry
  - When a flag on the timeline is clicked, open the EventEditor with that event's data
  - Pass all state management callbacks from `useTimelineState` to the appropriate components
  - Ensure the timeline re-renders reactively when events are added, edited, or deleted

- [x] Add visual feedback and interaction polish:
  - Flags on the timeline should have a hover effect (slight scale or glow) to indicate clickability
  - When hovering a flag, show a tooltip with the full event details (date, team, description)
  - Smooth transitions when events are added or removed (CSS transitions on opacity/position)
  - The currently-selected/editing event's flag should be visually highlighted on the timeline
  - Ensure keyboard accessibility — form inputs should be focusable and submittable with Enter
  - *Completed: Added scale+glow hover on flag heads, CSS tooltips with date/team/description, `eventFadeIn` animation for new events, `eventSelected` class highlighting the editing flag, keyboard nav (tabIndex, Enter/Space, aria-label, focus-visible styles) on flags. All forms already support Enter-to-submit via native `<form>`. Build passes cleanly.*

- [x] Verify the full CRUD workflow end-to-end:
  - Build the app with `npm run build` and fix any TypeScript or build errors
  - Run the dev server with `npm run dev`
  - Manually verify (via code review) that the add, edit, and delete flows are correctly wired
  - Rebuild the Docker image with `docker compose build` to ensure the updated app packages correctly
  - Run `docker compose up -d`, curl `http://localhost:8080` to verify it serves, then `docker compose down`
  - *Completed: `npm run build` passes cleanly (tsc + vite, 364 modules, zero errors). Code review confirmed all CRUD flows correctly wired: Add (EventForm → addEvent → useTimelineState), Edit (Timeline flag click → EventEditor → updateEvent), Delete (EventEditor two-click confirm → deleteEvent), Config (ConfigPanel → setConfig → reactive re-render). Docker image rebuilt successfully, `docker compose up -d` served HTTP 200 on localhost:8080 with correct HTML/JS/CSS assets, `docker compose down` clean teardown.*
