# Purdue-USB-Research-Resources-Website
(Built by Ryan)

# Tech Stack
frontend:
- React + Vite + Tailwind

backend:
- Serverless functions in `backend/` (deployed on Vercel), MongoDB Atlas for storage, Groq for
  AI moderation of submissions, and one SMTP account for all outbound email. There
  is no server process to keep running — each endpoint is its own function, cold-started on
  demand.

scheduled jobs:
- Two daily GitHub Actions, both independent of the API and of each other — "Sync Calendar
  Events" scrapes Purdue research events into Google Calendar, and "Keep Database Awake"
  stops Atlas pausing the free cluster. See [Scheduled jobs](#scheduled-jobs-github-actions).

# Layout

```
frontend/           the React app (its own package.json)
  src/config.js     public constants (must match backend/lib/constants.js)

api/                the serverless endpoints - each file IS one HTTP route
  auth/             signup, verify-email, resend-code, login, me,
                    request-password-reset, reset-password
  projects/         index.js (GET /api/projects), mine.js, [id].js (DELETE)
  submit.js         POST /api/submit

backend/            everything server-side that isn't an endpoint
  lib/              db, auth, mailer, rate limiting, http helpers, env, constants
  prompts/          the AI moderation system prompt
  scrapers/         Purdue event sources -> Google Calendar
  scripts/          entry points for the npm scripts and both GitHub Actions:
                    scrape.js, keepDatabaseAwake.js, ensureIndexes.js
  package.json      the server-side dependencies

package.json        npm workspace root: scripts only, no dependencies
```

A file's path under `api/` *is* its URL — `api/auth/login.js` serves `POST /api/auth/login`.
This is a Vercel requirement, not a choice: it only turns files under a root-level `api/`
directory into functions, and that path is not configurable. Everything those handlers lean on
lives in `backend/`, so adding an endpoint means adding one file under `api/` at the path you
want the URL to be.

`frontend/` and `backend/` are separate npm workspaces, so their dependencies stay separate and
a single `npm install` at the root sets up both. The `api/` handlers import from
`backend/lib/`, so they run on the backend workspace's dependencies.

Everything deploys as one Vercel project, so the frontend calls the API same-origin at
`/api/*` — no base URL to configure and no CORS to maintain.

# Running locally

Prerequisites: Node 22+, and a MongoDB you can reach (see step 3). Run everything from the
repo root unless a step says otherwise.

### 1. Install

```bash
npm install
```

One install at the root covers both workspaces — there is no separate install inside
`frontend/` or `backend/`.

### 2. Create your .env

```bash
cp .env.example .env
```

One `.env` at the **repo root** serves the whole repo — there is no second one inside
`backend/`. Fill in every value: **the code has no fallback defaults**, so a missing variable
raises a clear error naming it rather than quietly running on a guessed value.

`.env` holds only secrets and per-deployment connection details. Public settings that don't
vary between environments — the `@purdue.edu` signup domain, the 3-project cap, the Google
Calendar id and its timezone — are plain constants in
[backend/lib/constants.js](backend/lib/constants.js) and
[frontend/src/config.js](frontend/src/config.js). Those two files declare the same four values
for their respective halves, so **if you change one, change the other**.

The frontend reads **nothing** from `.env`. No environment variable is ever compiled into the
browser bundle, so a secret cannot leak into shipped JavaScript — and `npm run build` works
without a `.env` at all. Only the `api/` functions and `backend/` scripts read it.

Which variables matter for which task:

| Doing this | Needs |
|---|---|
| Frontend only | nothing |
| Anything touching the API | `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `JWT_TTL` |
| Signup / password reset | ...plus `SMTP_*` |
| Submitting a project | ...plus `GROQ_*` and `ADMIN_EMAIL` |
| `npm run scrape` | `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` |

### 3. Point at a database

Either use your Atlas cluster, or run one locally:

```bash
mkdir -p ~/usb-mongo
mongod --dbpath ~/usb-mongo --port 27017
# then in .env:  MONGODB_URI=mongodb://127.0.0.1:27017
```

Then create the indexes — **this is required, not optional**. The unique index on
`users.email` is what actually prevents duplicate accounts, and the TTL index is what expires
rate-limit windows:

```bash
npm run ensure-indexes
```

It's idempotent, so re-run it any time.

### 4. Start both halves

Two terminals:

```bash
npx vercel dev              # terminal 1 — API on http://localhost:3000
```
```bash
cd frontend && npm run dev  # terminal 2 — UI on http://localhost:5173
```

Open **http://localhost:5173**. Vite proxies `/api/*` to port 3000, which mirrors how the two
are served same-origin in production — so relative `/api/...` paths behave identically in dev
and prod.

> **First run of `vercel dev` prompts you to link a Vercel project** and writes a `.vercel/`
> folder (gitignored). It needs a Vercel account. If you only want to work on the frontend,
> you can skip it — the UI runs on its own, and API calls will just fail.

### Other commands

| Command | Does |
|---|---|
| `npm run ensure-indexes` | Create/verify the MongoDB indexes (idempotent) |
| `npm run scrape` | Run the calendar sync by hand |
| `npm run keepalive` | Ping the deployed API so Atlas stays awake (needs `SITE_URL`) |
| `npm run build` | Production build of the frontend |
| `npm run api` | Shorthand for `vercel dev` |

> The script is called `api`, not `dev`, on purpose. `vercel dev` auto-detects a `dev` script and
> runs it as the Development Command — so naming it `dev` makes `vercel dev` invoke itself and
> fail with `must not recursively invoke itself`.

### Troubleshooting

| Symptom | Cause |
|---|---|
| `X is not set. Every setting is read from the .env...` | That variable is missing from `.env`. There are no defaults by design — add it. If you added it after starting `vercel dev`, restart it. |
| Every login returns 401 after a code change | `JWT_SECRET` changed; tokens signed with the old one are dead. Log in again. |
| Signup 500s with an SMTP error | `SMTP_*` is wrong or unreachable. Gmail needs an App Password, not your account password. |
| `429` on login/signup while testing | The rate limiter is doing its job. Windows live in the `rate_limits` collection; delete the docs to reset. |
| Frontend loads but every API call 404s | Terminal 1 isn't running, or it's not on port 3000. |
| UI and API disagree about the project cap | `PROJECT_LIMIT` drifted between [backend/lib/constants.js](backend/lib/constants.js) and [frontend/src/config.js](frontend/src/config.js). |

# Deploying

1. Import the repo into Vercel. Leave the Root Directory at the repo root — `vercel.json`
   builds the frontend workspace and picks up `api/` automatically. Do **not** point the Root
   Directory at `frontend/` or `backend/`; Vercel needs to see both, plus the root `api/`.
2. Under Settings → Environment Variables (Production **and** Preview), add the 13 the API
   needs: `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `JWT_TTL`, `GROQ_API_KEY`, `GROQ_MODEL`,
   `GROQ_BASE_URL`, the five `SMTP_*`, and `ADMIN_EMAIL`. `GOOGLE_*` and `SITE_URL` are not
   used by the deployed API — they belong to the GitHub Actions instead (see the table under
   [Scheduled jobs](#scheduled-jobs-github-actions)).
3. In Atlas, allow network access from `0.0.0.0/0`. Serverless functions have no static egress
   IP, so IP allowlisting isn't available; use a DB user scoped to `readWrite` on `usb_board`
   with a long random password instead — that credential is what protects the database.
4. Run `npm run ensure-indexes` once against production. The unique index on `users.email` is
   what prevents duplicate accounts, so this is required, not optional.

Free-tier notes: Vercel Hobby covers this comfortably (1M function invocations, 100 GB
bandwidth/month) and is non-commercial only, which a student org site satisfies. Atlas M0 is
free at 512 MB. Gmail SMTP sends ~500 recipients/day on a free account with an App Password.

# Scheduled jobs (GitHub Actions)

Two workflows run daily at 08:00 UTC. They're kept separate on purpose — they do unrelated
things, so each gets its own run history and its own failure email. Both can also be triggered
by hand from the Actions tab (Run workflow).

Each workflow is a thin runner: it installs dependencies and calls an npm script, exactly like
running it by hand. All the logic lives in `backend/scripts/`, so both jobs can be tested
locally without pushing anything.

### `Sync Calendar Events` — [scrape-calendar.yml](.github/workflows/scrape-calendar.yml)
Runs `npm run scrape` → [backend/scripts/scrape.js](backend/scripts/scrape.js). Scrapes Purdue
research events into the Google Calendar the site embeds. Needs two repository **secrets**:
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (paste the full multi-line PEM — see the note below)

The calendar id isn't a secret — it's public in the embed URL — so it lives in
[backend/lib/constants.js](backend/lib/constants.js) instead.

### `Keep Database Awake` — [keep-database-awake.yml](.github/workflows/keep-database-awake.yml)
Runs `npm run keepalive` → [backend/scripts/keepDatabaseAwake.js](backend/scripts/keepDatabaseAwake.js), which
makes one request to `/api/projects` — an endpoint that reads MongoDB. Needs one repository
**variable** (not a secret; the URL is public):
- `SITE_URL` — e.g. `https://usb-research-resources.vercel.app`

This is not an optimization — it prevents an outage. Atlas pauses a free cluster after **30
days without a connection**, and a paused cluster **refuses every connection until a human
clicks Resume in the dashboard**; it does not wake itself when traffic arrives. Left alone over
a long break, the database would pause and every API route would return 500 while the static
site kept loading normally. A daily touch makes 30 days of inactivity unreachable.

It goes through the public HTTP endpoint rather than connecting with the driver so that no
database credential has to live in this public repo's Actions secrets, and it doubles as an
uptime check. It verifies the response really is the JSON array the handler returns — a 200
with an HTML body would mean the request never reached Mongo.

### Where each variable lives

Config is read from `process.env` either way, so the same code works locally and in CI. The
only difference is where the values come from: a `.env` file locally, injected values in
Actions and on Vercel. Nothing needs to be set in more than one place.

| Variable | Local `.env` | Vercel | GitHub Actions |
|---|:--:|:--:|:--:|
| `MONGODB_URI`, `MONGODB_DB` | ✓ | ✓ | — |
| `JWT_SECRET`, `JWT_TTL` | ✓ | ✓ | — |
| `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL` | ✓ | ✓ | — |
| `SMTP_*` (5), `ADMIN_EMAIL` | ✓ | ✓ | — |
| `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` | ✓ | — | secret |
| `SITE_URL` | optional | — | variable |

**`GOOGLE_PRIVATE_KEY` takes two shapes and both work.** In `.env` it's one quoted line with
literal `\n` escapes; as a GitHub secret you paste the real multi-line PEM. The scraper
normalizes either form, so don't try to escape newlines when pasting into GitHub.

### Two things that stop either workflow running

1. **Scheduled runs only fire from the default branch.** Both files must be on `main`.
2. **GitHub auto-disables scheduled workflows on public repos after 60 days with no new
   commits.** Runs, issues and releases don't reset that timer — only commits do. Worst case
   over a long quiet break: the workflows are disabled at day 60 and Atlas pauses at day 90.
   GitHub emails a warning first. If the repo goes quiet for a whole summer, either push a
   commit occasionally or make the repo private (the auto-disable is public-repos-only).

# Email
One SMTP account sends all four messages: the signup verification code, the password reset
code, the "your project was posted" confirmation to the submitter, and the new-submission
notice to `ADMIN_EMAIL`.

This used to be split across two providers — SMTP for the user-facing mail and EmailJS for the
admin notice. EmailJS is built for sending mail from a browser when you have no server, which
was true of this site before it had a backend. It isn't now, and it came with a tighter quota
(200/month free, against Gmail's ~500/day) while the message body and the recipient address
both lived in the EmailJS dashboard instead of this repo. Both are now in
[api/submit.js](api/submit.js).

# Admin accounts
There is no endpoint that grants admin. Set `isAdmin: true` on the user document in Mongo by
hand. Privileges are read from the database on every request, so it takes effect immediately —
the user does not need to log out and back in.

# Future updates
- Similar to PTP, allow people to make a post in a new section about a research project they're working on where people can join a new project or already existing research group. This is different from PTP in the sense that PTP project are usually fullstack apps, where this is catered more towards ML/interdisciplinary CS work. Should be a pretty easy addition in the future. (Test out how well PTP goes and iterate form there). This could also culminate in a research roundtable similar to the one ML@Purdue has.
