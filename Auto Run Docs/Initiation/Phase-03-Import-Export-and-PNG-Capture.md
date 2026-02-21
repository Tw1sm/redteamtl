# Phase 03: Import/Export & PNG Capture

This phase adds data portability and report generation. Users can save their timeline as a JSON file, reload it later, and export the entire timeline as a high-quality PNG image suitable for embedding in assessment reports. These are the core deliverables that make the tool useful in a real engagement workflow.

## Tasks

- [x] Implement JSON export functionality in `src/utils/fileExport.ts`:
  - Create a function `exportToJson(state: AppState)` that serializes the full app state (config + events) to a formatted JSON string
  - Trigger a browser file download with the filename pattern `redteam-timeline-YYYY-MM-DD.json`
  - Use `JSON.stringify` with 2-space indentation for human-readable output
  - The JSON structure should match the `AppState` interface exactly so it can be re-imported

- [x] Implement JSON import functionality in `src/utils/fileImport.ts`:
  - Create a function `importFromJson(file: File): Promise<AppState>` that reads a JSON file and parses it
  - Validate the parsed data against the `AppState` structure:
    - Must have `config` with `startDate`, `endDate`, `title`
    - Must have `events` array where each event has `id`, `date`, `team`, `description`
    - `team` must be "red" or "blue"
    - Dates must be valid ISO date strings
  - Return the validated `AppState` or throw a descriptive error
  - If events lack `id` fields (e.g., hand-crafted JSON), auto-generate IDs using `uuid`

- [x] Implement full-timeline PNG export in `src/utils/pngExport.ts`:
  - Create a function `exportToPng()` that captures the element with `id="timeline-capture"`
  - Use `html-to-image`'s `toPng` function to render the full timeline element (including overflow/scroll content)
  - Before capture, temporarily expand the timeline container to its full scrollable width so the entire timeline is visible (not clipped by viewport)
  - After capture, restore the container to its original scrollable state
  - Trigger a browser file download with filename `redteam-timeline-YYYY-MM-DD.png`
  - The exported PNG should have a clean background (match the app's dark theme) and be high-resolution enough for reports

- [x] Create the toolbar/action bar component in `src/components/Toolbar.tsx`:
  - A horizontal bar with action buttons: "Export JSON", "Import JSON", "Export PNG"
  - "Export JSON" calls the `exportToJson` utility with the current state
  - "Import JSON" opens a hidden file input (`<input type="file" accept=".json">`) and processes the selected file through `importFromJson`, then calls `loadState` on the result
  - "Export PNG" calls the `exportToPng` utility
  - Show a brief success/error notification after each action (a simple toast or status message that auto-dismisses)
  - Display any import validation errors clearly to the user
  - Style buttons to match the dark theme — distinct but not overwhelming

- [x] Integrate the Toolbar into the app and test the full workflow:
  - Add the `Toolbar` component to `src/App.tsx`, positioned at the top of the page near the header
  - Pass the necessary state and callbacks to the Toolbar
  - Build with `npm run build` and verify no errors
  - Rebuild Docker image: `docker compose build`
  - Run the container: `docker compose up -d`
  - Curl `http://localhost:8080` to verify the app is serving
  - `docker compose down` to clean up
