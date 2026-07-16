import axios from 'axios';

// Purdue's official campus-wide events calendar (events.purdue.edu) runs on Localist and
// has a public JSON API. It has no dedicated "Research" category, so we filter by keywords
// in the title/description to keep this focused on research-relevant events instead of
// pulling in every athletics game and student club meeting on campus.
const EVENTS_CALENDAR_API = 'https://events.purdue.edu/api/2/events';
const RESEARCH_KEYWORDS = /research|symposium|\bseminar\b|lecture series|laboratory|\blab\b|colloquium|dissertation defense|grant writing|discovery park|distinguished lecture/i;

export async function fetchPurdueEventsCalendar() {
  const { data } = await axios.get(EVENTS_CALENDAR_API, {
    params: { days: 180, pp: 100 }
  });
  const now = new Date();

  return (data.events || [])
    .map((wrapper) => wrapper.event)
    .filter((event) => RESEARCH_KEYWORDS.test(`${event.title} ${event.description_text || ''}`))
    .map((event) => {
      const startDate = new Date(event.first_date);
      const endDate = event.last_date && event.last_date !== event.first_date
        ? new Date(event.last_date)
        : null;

      return {
        title: event.title?.trim() || 'Untitled Event',
        date: startDate,
        endDate,
        description: `${event.description_text || ''}${event.location_name ? `\n\nLocation: ${event.location_name}` : ''}\n\nLink: ${event.localist_url || event.url}`
      };
    })
    .filter((event) => event.date > now);
}
