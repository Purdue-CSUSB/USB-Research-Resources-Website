import axios from 'axios';

// Purdue's Office of Research site (research.purdue.edu) is WordPress and exposes events
// through a custom post type's REST API - far more stable than scraping HTML.
const RESEARCH_OFFICE_API = 'https://research.purdue.edu/wp-json/wp/v2/event?per_page=100&_fields=title,link,content,acf';

export async function fetchPurdueResearchOffice() {
  const { data } = await axios.get(RESEARCH_OFFICE_API);
  const now = new Date();

  return data
    .filter((item) => item?.acf?.date?.start_time)
    .map((item) => {
      const startTime = new Date(item.acf.date.start_time.replace(' ', 'T'));
      const endTime = item.acf.date.end_time
        ? new Date(item.acf.date.end_time.replace(' ', 'T'))
        : null;
      const plainDescription = (item.content?.rendered || '').replace(/<[^>]+>/g, '').trim();
      const address = item.acf.address || '';

      return {
        title: item.title?.rendered?.trim() || 'Untitled Event',
        date: startTime,
        endDate: endTime,
        description: `${plainDescription}${address ? `\n\nLocation: ${address}` : ''}\n\nLink: ${item.link}`
      };
    })
    .filter((event) => event.date > now);
}
