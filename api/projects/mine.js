import { getDb } from '../../backend/lib/db.js';
import { methodGuard, withErrorHandling } from '../../backend/lib/http.js';
import { requireAuth } from '../../backend/lib/auth.js';

// Authenticated: returns the caller's own projects (used by the Account page and the
// 3-project-cap UI). Unlike the public board, this can safely include deadline/createdAt
// since it's scoped to the requester's own userId - it still omits email.
export default withErrorHandling('projects:mine', async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const db = await getDb();

  const projects = await db.collection('projects')
    .find({ userId: user._id })
    .project({ email: 0 })
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json(projects);
});
