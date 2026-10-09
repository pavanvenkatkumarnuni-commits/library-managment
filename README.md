# LibraryHub Modern — College Library Edition

A responsive React + TypeScript + Vite college library manager with local-first browser storage and an optional FastAPI backend. The frontend keeps working locally if no API URL is configured.

## Frontend: Render Static Site

- **Root Directory:** blank
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:** `VITE_API_URL` = your deployed backend URL (for example, `https://libraryhub-api.onrender.com`)

The Vite frontend reads and writes the catalogue, member records, and activity log to the API when `VITE_API_URL` is configured. Without it, the app remains localStorage-only.

## Backend: Render Web Service

Create a separate **Web Service** from this same repository:

- **Root Directory:** `backend`
- **Runtime:** Python
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/health`
- **Environment Variable:** `CORS_ORIGINS` = your frontend URL, or `*` for initial testing only

After the backend is Live, copy its `https://...` URL into the frontend Static Site's `VITE_API_URL` environment variable, then trigger a fresh frontend deploy. The API docs are available at `<backend-url>/docs`.

## Important free-hosting data note

The API uses SQLite for a simple, no-managed-database starter. Render free web services have an ephemeral filesystem, so SQLite data on that service is **not durable** across restarts/redeploys and may be lost. Use a persistent disk (where available) or a managed database for reliable production records. Keep exporting the in-app JSON backup before deployments or major changes. Do not store real student personal information in this demo until authentication, authorization, and durable storage are configured.

## Features

- Dashboard KPIs and book-category/availability charts
- Catalogue search, ISBN duplicate checks, cover URLs, lending, due dates, and overdue indicators
- College member records with student ID, department, and program
- Staff/admin demo roles, activity log, notifications, dark mode, and JSON backup/restore
- Optional API sync plus backend endpoints for catalogue, members, lending/returns, notifications, activity, and report summaries
- Refined motion, hover feedback, entrance transitions, keyboard focus styles, and reduced-motion accessibility support

## Demo login

- Admin password: `library123`
- Staff password: `staff123`

These are demo-only client-side credentials, not production authentication. The backend currently has no user authentication. Deploy it only for testing until secure authentication and role checks are implemented.

## Local development

Frontend:

```bash
npm install
npm run dev
```

Backend (Python 3.11+):

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Set `VITE_API_URL=http://127.0.0.1:8000` in a root `.env.local` file to connect local frontend to backend.
