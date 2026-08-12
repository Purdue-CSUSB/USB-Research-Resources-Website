import { google } from 'googleapis';
import { fetchPurdueResearchOffice } from './purdueResearchOffice.js';
import { fetchPurdueEventsCalendar } from './purdueEventsCalendar.js';
import { requireEnv } from '../lib/env.js';
import { CALENDAR_TIMEZONE, GOOGLE_CALENDAR_ID } from '../lib/constants.js';

// Each source is independent: if one site changes its markup/API and breaks, it just logs
// a warning and contributes zero events instead of taking down the whole sync.
const SOURCES = [
  { name: 'Purdue Office of Research', fetch: fetchPurdueResearchOffice },
  { name: 'Purdue Events Calendar', fetch: fetchPurdueEventsCalendar },
];

async function collectEvents() {
  const results = await Promise.allSettled(SOURCES.map((source) => source.fetch()));

  const events = [];
  results.forEach((result, index) => {
    const source = SOURCES[index];
    if (result.status === 'fulfilled') {
      console.log(`[${source.name}] found ${result.value.length} upcoming events`);
      events.push(...result.value);
    } else {
      console.error(`[${source.name}] failed:`, result.reason?.message || result.reason);
    }
  });

  // Dedupe in case the same event is posted through more than one source.
  const seenTitles = new Set();
  return events.filter((event) => {
    const key = event.title.toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
}

export async function runScrape() {
  console.log('1. Fetching Purdue research events from all sources...');

  const scrapedEvents = await collectEvents();
  console.log(`Found ${scrapedEvents.length} upcoming events across all sources. Connecting to Google Calendar...`);

  // SECURE CLOUD AUTHENTICATION
  const calendarIdToUse = GOOGLE_CALENDAR_ID;

  // The PEM is stored with literal "\n" so it survives being a single-line env value.
  const privateKey = requireEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: requireEnv('GOOGLE_CLIENT_EMAIL'),
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.events']
  });

  await auth.authorize();

  const calendar = google.calendar({ version: 'v3', auth });

  const existingEventsRes = await calendar.events.list({
    calendarId: calendarIdToUse,
    timeMin: new Date().toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const existingTitles = existingEventsRes.data.items.map((e) => e.summary);

  let addedCount = 0;

  for (const event of scrapedEvents) {
    if (existingTitles.includes(event.title)) {
      console.log(`Skipping duplicate: ${event.title}`);
      continue;
    }

    const gcalEvent = {
      summary: event.title,
      description: event.description,
      start: {
        date: event.date.toISOString().split('T')[0],
        timeZone: CALENDAR_TIMEZONE,
      },
      end: {
        date: (event.endDate || new Date(event.date.getTime() + 86400000)).toISOString().split('T')[0],
        timeZone: CALENDAR_TIMEZONE,
      },
    };

    await calendar.events.insert({
      calendarId: calendarIdToUse,
      resource: gcalEvent,
    });

    console.log(`Successfully added NEW event: ${event.title}`);
    addedCount++;
  }

  return {
    message: `Scrape complete! Found ${scrapedEvents.length} total events. Added ${addedCount} NEW events to Google Calendar.`,
    newEventsAdded: addedCount
  };
}
