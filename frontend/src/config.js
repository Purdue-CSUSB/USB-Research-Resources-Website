// Public, non-secret values that don't change between environments, so they live in code rather
// than .env. The frontend reads no environment variables at all: nothing secret can leak into
// the browser bundle because nothing secret is ever handed to it.
//
// KEEP IN SYNC WITH backend/lib/constants.js, which declares the same four values for the
// server half. They are duplicated rather than shared because frontend/ and backend/ are
// separate workspaces; if you change one, change the other.

// Checked before submitting the signup form purely to save a round trip. The server enforces
// the same domain independently - this is a convenience, not a security control.
export const ALLOWED_EMAIL_DOMAIN = '@purdue.edu';

// Drives the "Post a Project" button state and the count on the account page. Must match the
// server's cap, which is what actually rejects an over-limit submission.
export const PROJECT_LIMIT = 3;

// The shared Google Calendar embedded on the Calendar page - the same one the backend scraper
// writes events to.
export const GOOGLE_CALENDAR_ID =
  '88217dfcf4bcf746ad4132d93a9e0047a0c75e246d22dcb07fd75a8798ba0e65@group.calendar.google.com';

export const CALENDAR_TIMEZONE = 'America/Indiana/Indianapolis';
