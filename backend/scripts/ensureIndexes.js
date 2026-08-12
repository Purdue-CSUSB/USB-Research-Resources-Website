// Idempotent index setup. Run once after deploy (and any time this file changes):
//   npm run ensure-indexes
//
// createIndex is a no-op when an identical index already exists, so re-running is safe.
import { getMongoClient, getDb } from '../lib/db.js';

async function main() {
  const db = await getDb();

  // Unique email is the actual guard against duplicate accounts. Signup used to rely on a
  // read-then-write check with a race window; the insert now depends on this index to raise
  // E11000, which api/auth/signup.js turns back into the 409 response.
  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true, name: 'users_email_unique' }
  );
  console.log('users.email               unique index ready');

  // The public board sorts every document by createdAt, and /api/projects/mine filters by
  // userId. Both were unindexed collection scans.
  await db.collection('projects').createIndex(
    { createdAt: -1 },
    { name: 'projects_createdAt_desc' }
  );
  console.log('projects.createdAt        index ready');

  await db.collection('projects').createIndex(
    { userId: 1, createdAt: -1 },
    { name: 'projects_userId_createdAt' }
  );
  console.log('projects.userId           index ready');

  // Lets Mongo expire rate-limit windows on its own. expireAfterSeconds: 0 means "delete once
  // the date in expiresAt has passed", so lib/rateLimit.js never has to sweep old buckets.
  await db.collection('rate_limits').createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: 'rate_limits_ttl' }
  );
  console.log('rate_limits.expiresAt     TTL index ready');
}

main()
  .then(async () => {
    console.log('\nAll indexes are in place.');
    await (await getMongoClient()).close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to create indexes:', error.message);
    // A pre-existing duplicate email will fail the unique index build - report it usefully.
    if (error?.code === 11000) {
      console.error('\nThere are already duplicate emails in the users collection. Remove the');
      console.error('duplicates, then re-run this script.');
    }
    try {
      await (await getMongoClient()).close();
    } catch {
      // Nothing useful to do if teardown also fails.
    }
    process.exit(1);
  });
