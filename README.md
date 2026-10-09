# LibraryHub Modern

A free, local-first library management frontend built with React, TypeScript, Vite, Recharts, and browser localStorage. No database, Docker, or paid API is required.

## Deploy on Render Static Site

- **Root Directory:** leave blank
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment variables:** none required

Every push to `main` should trigger a new deploy if Auto-Deploy is enabled.

## Features

- Demo login screen (password: `library123`; not secure authentication)
- Dashboard statistics, category chart, and available/issued chart
- Add, edit, search, issue, return, and delete books
- Member registration, edit, search, and removal
- Prevents member removal while they have books on loan
- Due dates and automatically calculated overdue warnings
- Book cover image URLs with a fallback when an image cannot load
- Light/dark theme preference
- Full JSON backup and restore for books, members, and theme
- Responsive layout for desktop and mobile

## Run locally on Windows

Install Node.js, open Command Prompt in the project folder, then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Important limitations

This is a **frontend-only, local-first edition**, not a secure multi-user library service. Records are stored in the current browser profile and do not synchronize between visitors or devices. Clearing browser/site data can erase records. Export JSON backups regularly and store them outside the browser. Restoring replaces the current browser records, so export a backup first.

The demo login is only a client-side screen and must not be used to protect sensitive information. Do not store sensitive member information in this version. Uploaded cover URLs rely on the remote image host being available. A production multi-user system needs a backend, persistent database, and server-side authentication.
