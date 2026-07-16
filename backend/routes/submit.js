import OpenAI from 'openai';
import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';
import { sendMail } from '../lib/mailer.js';

function sendError(res, status, stage, error) {
  console.error(`[submit:${stage}]`, error);
  return res.status(status).json({
    message: error?.message || "Internal server error.",
    stage,
    details: error?.response?.data || error?.cause?.message || undefined
  });
}

// Moderation runs against Groq's free-tier API - no cost at this project's volume, and it
// keeps working once deployed (unlike a local-only model, which needs this machine running).
function getModerationClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set.');
  }
  return {
    client: new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey }),
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
  };
}

export default async function submitHandler(req, res) {
  // Accept the payload shape used by the ResearchProjects form. The submitter's identity
  // (email/userId) comes from the authenticated account, never from the request body.
  const {
    title,
    description,
    techStack,
    requirements,
    rolesNeeded,
    timeCommitment,
    compensation,
    deadline,
    manager
  } = req.body;

  const projectManager = manager || req.user.email;
  const techStackList = Array.isArray(techStack)
    ? techStack
    : techStack
      ? techStack.split(',').map(tech => tech.trim())
      : [];

  try {
    let aiResponse;
    try {
      const { client, model } = getModerationClient();
      console.log('Running AI Moderation (Groq)...');
      aiResponse = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "You are a moderator for a university computer science club. Reply with strictly 'APPROVED' or 'REJECTED' based on if the project is professional and tech-related." },
          { role: "user", content: `Evaluate this project: ${title} - ${description}` }
        ],
        max_tokens: 10,
        temperature: 0.0,
      });
    } catch (error) {
      return sendError(res, 500, 'moderation', error);
    }

    const moderationResult = aiResponse.choices?.[0]?.message?.content?.trim();
    if (moderationResult !== 'APPROVED') {
      return res.status(400).json({
        message: "Submission rejected by moderation filter.",
        stage: "moderation",
        details: moderationResult || "No moderation result returned."
      });
    }

    console.log("Approved! Saving to database...");
    try {
      const db = await getDb();
      const collection = db.collection('projects');

      const newProject = {
        title: title,
        description: description,
        manager: projectManager,
        authorName: projectManager,
        userId: new ObjectId(req.user.userId),
        email: req.user.email, // Saved securely in DB, hidden from frontend
        techStack: techStackList,
        requirements: requirements || '',
        rolesNeeded: rolesNeeded || '',
        timeCommitment: timeCommitment || '',
        compensation: compensation || '',
        deadline: deadline || '',
        createdAt: new Date()
      };

      await collection.insertOne(newProject);
    } catch (error) {
      return sendError(res, 500, 'database', error);
    }

    console.log("Saved! Notifying submitter...");
    try {
      await sendMail({
        to: req.user.email,
        subject: `Your project "${title}" was posted`,
        text: `Hi,\n\nYour project "${title}" has been posted to the USB Research Resources project board.\n\n- USB Research Resources`
      });
    } catch (error) {
      console.error('[submit:notify]', error);
      // Don't fail the whole submission just because the confirmation email didn't send.
    }

    console.log("Pinging admin...");
    const emailEnvReady = [
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      process.env.EMAILJS_PUBLIC_KEY,
      process.env.EMAILJS_PRIVATE_KEY
    ].every(Boolean);

    if (emailEnvReady) {
      try {
        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY,
            template_params: {
              ...req.body,
              manager: projectManager,
              authorName: projectManager,
              email: req.user.email,
              techStack: techStackList
            }
          })
        });

        if (!emailResponse.ok) {
          const emailBody = await emailResponse.text();
          throw new Error(`EmailJS rejected the request (${emailResponse.status}): ${emailBody}`);
        }
      } catch (error) {
        return sendError(res, 502, 'email', error);
      }
    } else {
      console.warn('[submit:email] Skipping EmailJS because one or more EmailJS env vars are missing.');
    }

    return res.status(200).json({
      message: 'Project permanently saved to database!',
      stage: 'ok'
    });
  } catch (error) {
    return sendError(res, 500, 'unknown', error);
  }
}
