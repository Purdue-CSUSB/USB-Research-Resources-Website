import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';

export default async function projectsHandler(req, res) {
  try {
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
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ message: "Failed to fetch projects." });
  }
}

// Authenticated: returns the caller's own projects (used by the Account page and the
// 3-project-cap UI). Unlike the public board, this can safely include deadline/createdAt
// since it's scoped to the requester's own userId - it still omits email.
export async function myProjectsHandler(req, res) {
  try {
    const db = await getDb();

    const projects = await db.collection('projects')
      .find({ userId: new ObjectId(req.user.userId) })
      .project({ email: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ message: "Failed to fetch your projects." });
  }
}

// Auth is enforced by requireAuth at the route level in server.js. Any signed-in user may
// delete their own project; admins may delete any project.
export async function deleteProjectHandler(req, res) {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project id.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('projects');

    const project = await collection.findOne({ _id: new ObjectId(id) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isOwner = project.userId && project.userId.toString() === req.user.userId;
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own projects.' });
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({ message: 'Project deleted.' });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Failed to delete project." });
  }
}
