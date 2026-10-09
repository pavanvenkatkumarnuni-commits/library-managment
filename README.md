# LibraryHub Basic

A responsive React + TypeScript library catalogue. No backend, database, Docker, or environment variables.

## Run on Windows
1. Install Node.js LTS: https://nodejs.org/
2. Open Command Prompt in this folder.
3. Run `npm install`
4. Run `npm run dev`
5. Open the localhost URL Vite prints.

## Deploy on Render (Static Site)
1. Upload all files and folders in this project to a GitHub repository.
2. In Render, select **New + → Static Site** and connect the repository.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Create the static site. No database or environment variables are needed.

## Features
- Add, edit, search, filter, issue, return, and delete books.
- Dashboard counts and availability overview.
- Export JSON backup and import/restore from JSON.
- Browser localStorage persistence and responsive layout.

## Data and privacy limitations
The catalogue lives in the current browser only. It is not shared between visitors or devices. Clearing browser/site data may erase it. Export JSON backups regularly and store them somewhere safe. Import replaces the current catalogue, so export your current data first if you need to keep it. Sample books are included on first launch.

This is a demo/learning app with no login, authentication, or access control. It is not intended for sensitive or multi-user library data. Render free plan availability and limits may change; check current pricing before deploying.
