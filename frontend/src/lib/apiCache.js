// A tiny in-memory cache for GET responses, so leaving a page and coming back doesn't re-hit
// the database for data we already have.
//
// Module scope on purpose: a route change unmounts the page component, so anything held in its
// state is gone by the time the user navigates back. This lives outside React and survives.
// It is memory only - a refresh starts clean, which is the behaviour we want, since a hard
// reload is how someone asks for genuinely current data.
//
// The read pattern is stale-while-revalidate: render whatever is cached immediately (no
// spinner), and refetch in the background only once the entry is past FRESH_MS. That keeps
// the board feeling instant while still picking up other people's posts within a minute.

const store = new Map();

// In-flight requests, keyed the same way, so two callers asking for the same thing at the same
// moment share one round trip instead of racing. This is not just a dev-mode concern: React's
// StrictMode double-invokes effects, but so does mounting the board and the account page in
// quick succession, since both read the caller's own projects.
const inflight = new Map();

// Incremented whenever the cache is cleared. A response that was already in the air when the
// account changed belongs to the previous session, so it must not be written afterwards.
let generation = 0;

// How long an entry is trusted without a background refetch.
export const FRESH_MS = 60_000;

export const CACHE_KEYS = {
  projects: 'projects',
  // Per-account, so one user's projects can never be shown to the next one signed in.
  myProjects: (email) => `projects:mine:${email ?? 'anonymous'}`
};

export function readCache(key) {
  return store.get(key) ?? null;
}

export function writeCache(key, data) {
  store.set(key, { data, fetchedAt: Date.now() });
}

// Apply a local change (a new project, a deleted one) to a cached list without a round trip.
// The timestamp is left alone: a local edit doesn't make the rest of the list any fresher.
export function mutateCache(key, update) {
  const entry = store.get(key);
  if (!entry) return;
  store.set(key, { data: update(entry.data), fetchedAt: entry.fetchedAt });
}

export function isStale(entry, ttl = FRESH_MS) {
  return !entry || Date.now() - entry.fetchedAt > ttl;
}

// Run `fetcher` and store the result under `key`, collapsing concurrent calls into one request
// and resolving them all with the same data. Returns the fetched data.
export function revalidate(key, fetcher) {
  const existing = inflight.get(key);
  if (existing) return existing;

  const startedAt = generation;
  const request = (async () => {
    const data = await fetcher();
    // Dropped if the account changed while this was in flight - see `generation` above.
    if (startedAt === generation) writeCache(key, data);
    return data;
  })().finally(() => {
    if (inflight.get(key) === request) inflight.delete(key);
  });

  inflight.set(key, request);
  return request;
}

// Called whenever the signed-in account changes. Anything cached belonged to the previous
// session, including the public board: an admin sees the same rows but acts on them
// differently, and a stale project count would misreport the 3-project cap.
export function clearCache() {
  store.clear();
  inflight.clear();
  generation += 1;
}
