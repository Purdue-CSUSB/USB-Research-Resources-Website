// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { GOOGLE_CALENDAR_ID, CALENDAR_TIMEZONE } from '../config.js';
import PageHeader, { PageShell } from '../components/ui/PageHeader.jsx';
import { fadeUp } from '../components/ui/motion.js';

export default function CalendarPage() {
    // Both are public constants in src/config.js, matching backend/lib/constants.js, so the
    // embed points at the same calendar the scraper writes events to.
    const calendarId = encodeURIComponent(GOOGLE_CALENDAR_ID)
    const timeZone = encodeURIComponent(CALENDAR_TIMEZONE)

    return (
        <PageShell width="max-w-6xl">
            <PageHeader
                title="Research"
                accent="Calendar"
                lead="Stay updated with research events, deadlines, and important dates at Purdue University."
            />

            <motion.div
                {...fadeUp(0, 0.15)}
                className="bg-white border border-usb-border rounded-2xl shadow-lg p-4 sm:p-6"
            >
                {/* calendar.google.com is the one external frame vercel.json's CSP allows. */}
                <iframe
                    title="Google Calendar"
                    src={`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=${timeZone}`}
                    className="w-full rounded-xl border-0"
                    style={{ height: '600px' }}
                    allowFullScreen
                />
            </motion.div>
        </PageShell>
    );
}
