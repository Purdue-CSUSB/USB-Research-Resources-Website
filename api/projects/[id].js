import { ObjectId } from 'mongodb';
import { getDb } from '../../backend/lib/db.js';
import { methodGuard, withErrorHandling } from '../../backend/lib/http.js';
import { requireAuth } from '../../backend/lib/auth.js';

// Any signed-in user may delete their own project; admins may delete any project.
// Note: `mine.js` is a static route, so Vercel matches /api/projects/mine there rather than
// falling through to this dynamic segment.
export default withErrorHandling('projects:delete', async (req, res) => {
  if (!methodGuard(req, res, 'DELETE')) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project id.' });
  }

  const db = await getDb();
  const collection = db.collection('projects');

  const project = await collection.findOne({ _id: new ObjectId(id) });
  if (!project) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  // isAdmin comes from the freshly-read user document, not from the JWT, so revoking admin in
  // Mongo takes effect on the next request instead of whenever the old 1d token expired.
  const isOwner = project.userId && project.userId.toString() === user._id.toString();
  if (!isOwner && !user.isAdmin) {
    return res.status(403).json({ message: 'You can only delete your own projects.' });
  }

  await collection.deleteOne({ _id: new ObjectId(id) });

  return res.status(200).json({ message: 'Project deleted.' });
});
