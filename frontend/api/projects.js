import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('usb_board');
    
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
  } finally {
    await client.close();
  }
}