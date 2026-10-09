# LibraryHub Modern

Free local-first library manager built with React, TypeScript, Vite, Recharts, and browser localStorage. No database or Docker required.

## Render Static Site settings
- Root Directory: blank
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variables: none

## Features
- Dashboard KPIs and book-category/availability charts
- Catalogue search, ISBN duplicate checks, book cover URLs, issue/return and due dates
- Member registration, edit, search and deletion protection for members with active loans
- Admin and Staff demo roles with client-side UI restrictions
- Member self-service screen to view current loans and renew for 14 days
- Overdue warnings and notification panel
- Activity log and CSV catalogue export
- JSON backup/restore including books, members, theme and activity history
- Light/dark mode and responsive layout

## Demo access
- Admin password: `library123`
- Staff password: `staff123`
- Any username is accepted for this demo.

**Security warning:** The login and roles are client-side demonstrations only. They do not provide real authentication or security; a visitor can bypass them. Do not use for sensitive member information or as a real multi-user service.

## Run locally on Windows
Install Node.js, open Command Prompt in the project folder, then run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints.

## Data, backups and limitations
Data is stored in the current browser profile. It does not sync between people, browsers, or devices. Clearing browser/site data can erase records. Export JSON backups regularly and keep copies outside the browser. CSV is for catalogue reporting; JSON contains the restorable data. Restore replaces current records, so export a backup first. External cover-image URLs need their host to remain available.

## Deployment verification
After pushing to `main`, open Render → your Static Site → Deploys. Wait for the newest deploy to finish with **Live**, then open the site and hard refresh with `Ctrl+F5`. If the build fails, inspect the first red build-log error; a GitHub commit alone does not prove a successful deployment.
