// Public, non-secret values that don't change between environments, so they live in code rather
// than .env. .env is reserved for secrets and per-deployment connection details.
//
// KEEP IN SYNC WITH frontend/src/config.js, which declares the same four values for the browser
// half. They are duplicated rather than shared because frontend/ and backend/ are separate
// workspaces; if you change one, change the other.

// Email domain allowed to register. This is the real gate - the identical check in the frontend
// is only a UX shortcut that saves a round trip.
export const ALLOWED_EMAIL_DOMAIN = '@purdue.edu';

// Max active projects per non-admin account. If this were lower than the frontend's, the UI
// would invite people to post submissions the API rejects.
export const PROJECT_LIMIT = 3;

// The shared Google Calendar: the scraper writes events to it and the Calendar page embeds it.
// Public by design - it's visible in the embed URL any visitor can read.
export const GOOGLE_CALENDAR_ID =
  '04165af12aa6a32e489954a33c67ea5abde441448456f1e8cbfecb34306aae16@group.calendar.google.com';

export const CALENDAR_TIMEZONE = 'America/Indiana/Indianapolis';
