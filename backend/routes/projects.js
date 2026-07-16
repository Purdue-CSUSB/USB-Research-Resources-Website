import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';

export default async function projectsHandler(req, res) {
  try {
    const db = await getDb();

    const projects = await db.collection('projects')
      .find({})
      // SECURE PROJECTION: 0 means hide this field from the frontend
      .project({
        email: 0
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ message: "Failed to fetch projects." });
  }
}

// Auth (isAdmin) is enforced by the requireAdmin middleware at the route level in server.js.
export async function deleteProjectHandler(req, res) {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project id.' });
  }

  try {
    const db = await getDb();

    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.status(200).json({ message: 'Project deleted.' });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Failed to delete project." });
  }
}
