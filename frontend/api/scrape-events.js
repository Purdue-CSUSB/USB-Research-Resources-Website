import { google } from 'googleapis';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("1. Fetching Purdue Research Events...");
    
    const purdueUrl = 'https://www.purdue.edu/research/oevprp/events/';
    const { data } = await axios.get(purdueUrl);
    const $ = cheerio.load(data);
    
    const scrapedEvents = [];

    $('div.event-box').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const dateString = $(element).find('.date').text().trim();
      const timeAndLocation = $(element).find('p').text().trim();
      
      // Fixes the crash if a link is missing
      const rawLink = $(element).find('a.details').attr('href') || "";
      let eventLink = purdueUrl; 
      
      if (rawLink !== "") {
        eventLink = rawLink.startsWith('http') 
          ? rawLink 
          : `https://www.purdue.edu/research/oevprp/${rawLink}`;
      }
      
      if (title && dateString) {
        scrapedEvents.push({
          title,
          date: new Date(dateString), 
          description: `${timeAndLocation}\n\nLink: ${eventLink}`
        });
      }
    });

    console.log(`Found ${scrapedEvents.length} events on the website. Connecting to Google Calendar...`);

    // SECURE CLOUD AUTHENTICATION
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const calendarIdToUse = process.env.GOOGLE_CALENDAR_ID;

    const auth = new google.auth.JWT({
      email: clientEmail,
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
    
    const existingTitles = existingEventsRes.data.items.map(e => e.summary);

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
          timeZone: 'America/Indiana/Indianapolis',
        },
        end: {
          date: new Date(event.date.getTime() + 86400000).toISOString().split('T')[0],
          timeZone: 'America/Indiana/Indianapolis',
        },
      };

      await calendar.events.insert({
        calendarId: calendarIdToUse,
        resource: gcalEvent,
      });
      
      console.log(`Successfully added NEW event: ${event.title}`);
      addedCount++;
    }

    return res.status(200).json({ 
      message: `Scrape complete! Found ${scrapedEvents.length} total events. Added ${addedCount} NEW events to Google Calendar.`,
      newEventsAdded: addedCount
    });

  } catch (error) {
    console.error("Scraper Error:", error);
    return res.status(500).json({ message: "Scraper failed to run.", error: error.message });
  }
}