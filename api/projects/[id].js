import { ObjectId } from 'mongodb';
import { getDb } from '../../backend/lib/db.js';
import { bodyTooLarge, clientIp, methodGuard, withErrorHandling } from '../../backend/lib/http.js';
import { requireAuth } from '../../backend/lib/auth.js';
import { enforceRateLimit } from '../../backend/lib/rateLimit.js';
import { moderateProject, parseProjectInput } from '../../backend/lib/projectInput.js';

// DELETE removes a project; PUT edits one. Both are owner-or-admin: a signed-in user may act on
// their own projects, and an admin may act on anyone's.
// Note: `mine.js` is a static route, so Vercel matches /api/projects/mine there rather than
// falling through to this dynamic segment.

// Reads the project named by the URL and checks the caller is allowed to change it.
// Returns { project, collection } or null once it has already answered the request.
async function loadEditableProject(req, res, user) {
  const { id } = req.query;
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid project id.' });
    return null;
  }

  const db = await getDb();
  const collection = db.collection('projects');

  const project = await collection.findOne({ _id: new ObjectId(id) });
  if (!project) {
    res.status(404).json({ message: 'Project not found.' });
    return null;
  }

  // isAdmin comes from the freshly-read user document, not from the JWT, so revoking admin in
  // Mongo takes effect on the next request instead of whenever the old 1d token expired.
  const isOwner = project.userId && project.userId.toString() === user._id.toString();
  if (!isOwner && !user.isAdmin) {
    res.status(403).json({ message: 'You can only change your own projects.' });
    return null;
  }

  return { project, collection, objectId: new ObjectId(id) };
}

export default withErrorHandling('projects:mutate', async (req, res) => {
  if (!methodGuard(req, res, ['DELETE', 'PUT'])) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'DELETE') {
    const found = await loadEditableProject(req, res, user);
    if (!found) return;

    await found.collection.deleteOne({ _id: found.objectId });
    return res.status(200).json({ message: 'Project deleted.' });
  }

  // PUT: edit an existing project.
  if (bodyTooLarge(req, res)) return;

  const found = await loadEditableProject(req, res, user);
  if (!found) return;

  // Same validation as the create path - an edit that skipped it would be a way to write
  // anything you liked by posting something clean and rewriting it afterwards.
  const parsed = parseProjectInput(req.body);
  if (parsed.error) {
    return res.status(400).json(parsed.error);
  }
  const fields = parsed.fields;

  // Rate limited on the same grounds as submitting: this path also spends a Groq call, and an
  // edit loop would otherwise be a free way to burn the quota. Admins are exempt, as there.
  if (!user.isAdmin) {
    if (!(await enforceRateLimit(res, 'submit', [clientIp(req), user._id.toString()]))) return;
  }

  // Edits are moderated too, for the reason above.
  const moderation = await moderateProject(fields);
  if (moderation.error) {
    const isRejection = moderation.error.stage === 'moderation';
    return res.status(isRejection ? 400 : 500).json(moderation.error);
  }

  // Only the fields the form owns are written. userId, email, and createdAt are deliberately
  // absent, so an edit can never reassign a project to someone else or forge its age.
  const updates = { ...fields, authorName: fields.manager, updatedAt: new Date() };
  await found.collection.updateOne({ _id: found.objectId }, { $set: updates });

  // Echo the saved document back minus the private account email, matching /api/projects/mine.
  const { email: _email, ...savedProject } = { ...found.project, ...updates };

  return res.status(200).json({
    message: 'Project updated.',
    stage: 'ok',
    project: savedProject
  });
});
