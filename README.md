# Purdue-USB-Research-Resources-Website
(Built by Ryan)

# Tech Stack
frontend:
- React + Vite + Tailwind

backend:
- Node/Express API (project board with MongoDB + OpenAI moderation, EmailJS notifications,
  and a Google Calendar scraper) — runs locally only, not deployed

# Running locally
This project is local-only (no live deployment). You need two terminals:

1. Backend — `cd backend`, `npm install`, fill in real values in `backend/.env` (copy
   `backend/.env.example` for the list of variables), then `npm run dev`. Starts the API on
   `http://localhost:5001`.
2. Frontend — `cd frontend`, `npm install`, `npm run dev`. Vite proxies `/api/*` requests to
   the backend automatically, so the project board and submission form work as-is.

# Future updates
- Similar to PTP, allow people to make a post in a new section about a research project they're working on where people can join a new project or already existing research group. This is different from PTP in the sense that PTP project are usually fullstack apps, where this is catered more towards ML/interdisciplinary CS work. Should be a pretty easy addition in the future. (Test out how well PTP goes and iterate form there). This could also culminate in a research roundtable similar to the one ML@Purdue has.
