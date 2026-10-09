# LibraryHub Modern — free static deployment

Modern React + TypeScript + Vite library manager. Uses browser `localStorage`; no database, backend, Docker, or paid API is required.

## GitHub structure

The repository root must contain `package.json`, `index.html`, `vite.config.ts`, `tsconfig.app.json`, and a `src/` folder containing `App.tsx`, `main.tsx`, and `styles.css`.

## Deploy on Render Static Site

- Root Directory: leave blank
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variables: none required

The included `render.yaml` describes these settings.

## Run locally on Windows

Install Node.js LTS, open Command Prompt in the project folder, then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Features

- Dashboard statistics and category/availability charts
- Add, edit, search, issue, return, and delete books
- Member management
- Due dates and overdue indicators
- Book cover images via URL or local upload
- Light/dark mode
- JSON export and restore of books, members, and theme
- Browser localStorage persistence

## Demo login

Default password: `library123`. The username is only a display label. This is not secure authentication.

## Important data limitations

Data is stored only in the current browser profile and is not shared across devices or visitors. Clearing browser/site data can erase records. Export JSON backups regularly and keep copies outside the browser. Restoring a backup replaces current records, so export first. Uploaded images consume browser storage; keep them small.

This is a front-end demo, not suitable for sensitive member data or real multi-user access control. Render's free plan and limits can change; check its current terms.
