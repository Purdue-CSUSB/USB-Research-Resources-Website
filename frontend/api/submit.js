import OpenAI from 'openai';
import { MongoClient } from 'mongodb';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // 1. Explicitly grab ONLY the fields you want to allow
  const { title, description, techStack, authorName, email } = req.body;

  try {
    console.log("Running AI Moderation...");
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a moderator for a university computer science club. Reply with strictly 'APPROVED' or 'REJECTED' based on if the project is professional and tech-related." },
        { role: "user", content: `Evaluate this project: ${title} - ${description}` }
      ],
      max_tokens: 10,
      temperature: 0.0,
    });

    if (aiResponse.choices[0].message.content.trim() !== 'APPROVED') {
      return res.status(400).json({ message: "Submission rejected by moderation filter." });
    }

    console.log("Approved! Saving to database...");
    await client.connect();
    const db = client.db('usb_board');
    const collection = db.collection('projects');
    
    // 2. Build the secure object
    const newProject = {
      title: title,
      description: description,
      authorName: authorName,
      email: email, // Saved securely in DB, hidden from frontend
      techStack: techStack ? techStack.split(',').map(tech => tech.trim()) : [], 
      createdAt: new Date()
    };
    
    await collection.insertOne(newProject);

    console.log("Saved! Sending email...");
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: req.body
      })
    });

    return res.status(200).json({ message: 'Project permanently saved to database!' });
  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ message: error.message || "Internal server error." });
  } finally {
    await client.close();
  }
}