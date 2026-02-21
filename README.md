# Red Team Timeline

A reporting tool for visualizing the timeline of significant red team & blue team events.

### Example
https://github.com/user-attachments/assets/50565644-73f2-47e3-a14d-bab803875ea3


### Exported PNG

![Exported PNG](.demo/export.png)


## Quick Start
The app runs locally in a Docker container:

```bash
docker compose up -d
```

Open [http://localhost:8080/index.html](http://localhost:8080/index.html) in your browser.

To stop:

```bash
docker compose down
```

## Development
```bash
npm install
npm run dev
```

## Tech Stack
- React 19 + TypeScript
- Vite
- date-fns
- html-to-image
- Docker + Nginx
