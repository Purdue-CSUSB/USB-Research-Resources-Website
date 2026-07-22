// Standalone entry point for the daily calendar sync. Run by the "Sync Calendar Events"
// GitHub Action (and usable locally via `npm run scrape`) so keeping the calendar current
// no longer needs the backend server running.
import { runScrape } from '../scrapers/syncCalendar.js';

runScrape()
  .then((result) => {
    console.log(result.message);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Scrape failed:', error.message);
    process.exit(1);
  });
