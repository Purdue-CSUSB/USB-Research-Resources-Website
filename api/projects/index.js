import { getDb } from '../../backend/lib/db.js';
import { methodGuard, withErrorHandling } from '../../backend/lib/http.js';

export default withErrorHandling('projects:list', async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;

  const db = await getDb();

  const projects = await db.collection('projects')
    .find({})
    // SECURE PROJECTION: 0 means hide this field from the public response.
    // email + userId are internal-only and must never reach the unauthenticated board.
    .project({
      email: 0,
      userId: 0
    })
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json(projects);
});
