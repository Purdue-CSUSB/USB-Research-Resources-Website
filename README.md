# Purdue-USB-Research-Resources-Website
(Built by Ryan)

# Tech Stack
frontend:
- React + Vite + Tailwind

backend:
- Node/Express API (project board with MongoDB + OpenAI moderation, EmailJS notifications)
  — runs locally only, not deployed

calendar sync:
- The Purdue research-events → Google Calendar scrape runs daily as the "Sync Calendar
  Events" GitHub Action (`.github/workflows/scrape-calendar.yml`), not the backend, so the
  calendar stays current without any server running.

# Running locally
This project is local-only (no live deployment). You need two terminals:

1. Backend — `cd backend`, `npm install`, fill in real values in `backend/.env` (copy
   `backend/.env.example` for the list of variables), then `npm run dev`. Starts the API on
   `http://localhost:5001`.
2. Frontend — `cd frontend`, `npm install`, `npm run dev`. Vite proxies `/api/*` requests to
   the backend automatically, so the project board and submission form work as-is.

To run the calendar scrape by hand: `cd backend`, `npm run scrape` (loads `backend/.env`).

# Calendar sync (GitHub Action)
The daily sync runs at 08:00 UTC via `.github/workflows/scrape-calendar.yml` and can also be
triggered manually from the repo's Actions tab (Run workflow). It costs nothing to run: free on
public repos, and well within the free-tier minutes on private ones (a ~1–2 min Linux job/day).

It needs three repository secrets (Settings → Secrets and variables → Actions), using the same
values as `backend/.env`:
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (paste the full PEM; multiline is fine)
- `GOOGLE_CALENDAR_ID`

Note: scheduled runs only fire from the default branch (`main`), so this workflow must be on
`main` for the daily trigger to take effect.

# Future updates
- Similar to PTP, allow people to make a post in a new section about a research project they're working on where people can join a new project or already existing research group. This is different from PTP in the sense that PTP project are usually fullstack apps, where this is catered more towards ML/interdisciplinary CS work. Should be a pretty easy addition in the future. (Test out how well PTP goes and iterate form there). This could also culminate in a research roundtable similar to the one ML@Purdue has.
