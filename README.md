# Red Team Timeline

A visual timeline tool for planning and documenting red team / blue team security assessments. Built with React, TypeScript, and Vite.

## Quick Start

```bash
docker compose up -d
```

Open [http://localhost:8080/index.html](http://localhost:8080/index.html) in your browser.

To stop:

```bash
docker compose down
```

## Features

- Interactive timeline visualization with red team (above) and blue team (below) event flags
- Add, edit, and delete assessment events with date, team, and description
- Sortable list view as an alternative to the timeline
- Export/import assessment data as JSON
- Export timeline as a print-ready PNG image
- Configurable assessment title and date range
- Collision-aware flag stacking and cluster overflow handling

## Development

```bash
npm install
npm run dev
```

## Tech Stack

- React 19 + TypeScript
- Vite
- date-fns
- html-to-image (PNG export)
- Docker + Nginx (production)
