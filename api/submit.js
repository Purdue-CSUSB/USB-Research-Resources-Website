import { getDb } from '../backend/lib/db.js';
import { sendMail } from '../backend/lib/mailer.js';
import { enforceRateLimit } from '../backend/lib/rateLimit.js';
import { bodyTooLarge, clientIp, methodGuard, withErrorHandling } from '../backend/lib/http.js';
import { requireAuth } from '../backend/lib/auth.js';
import { requireEnv } from '../backend/lib/env.js';
import { PROJECT_LIMIT } from '../backend/lib/constants.js';
import { moderateProject, parseProjectInput } from '../backend/lib/projectInput.js';

function sendError(res, status, stage, error) {
  // Log the full error server-side, but return only a generic message + stage so raw
  // Groq/Mongo/SMTP internals are never disclosed to the client.
  console.error(`[submit:${stage}]`, error);
  return res.status(status).json({
    message: 'Something went wrong while processing your submission. Please try again.',
    stage
  });
}

// Best-effort admin notification. Failures are logged and reported as a warning on an otherwise
// successful response - never as an error, see the call site.
//
// This used to go through EmailJS, which was a leftover from when the site was frontend-only and
// had no server to send mail from. It went over the same wire as the SMTP mail above but on a
// tighter quota (200/month free vs Gmail's ~500/day), and both the message template and the
// recipient address lived in EmailJS's dashboard rather than in this repo - so nobody reading
// the code could tell who got notified, or change what they received.
async function notifyAdmin(project) {
  // Field list is explicit rather than a spread of the request body, so a caller can't smuggle
  // unexpected keys into the message.
  const lines = [
    `A new project was submitted to the USB Research Resources board.`,
    ``,
    `Title:           ${project.title}`,
    `Submitted by:    ${project.submitterEmail}`,
    `Project manager: ${project.manager}`,
    `Contact email:   ${project.contactEmail}`,
    `Tech stack:      ${project.techStack.join(', ') || 'N/A'}`,
    `Roles needed:    ${project.rolesNeeded || 'N/A'}`,
    `Requirements:    ${project.requirements || 'N/A'}`,
    `Time commitment: ${project.timeCommitment || 'N/A'}`,
    `Compensation:    ${project.compensation || 'N/A'}`,
    `Deadline:        ${project.deadline || 'N/A'}`,
    ``,
    `Description:`,
    project.description,
  ];

  await sendMail({
    to: requireEnv('ADMIN_EMAIL'),
    subject: `New project submitted: ${project.title}`,
    text: lines.join('\n'),
  });
}

export default withErrorHandling('submit:unknown', async (req, res) => {
  if (!methodGuard(req, res, 'POST')) return;
  if (bodyTooLarge(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  // Accept the payload shape used by the ResearchProjects form. The submitter's identity
  // (email/userId) comes from the authenticated account, never from the request body.
  // Validation lives in backend/lib/projectInput.js so the edit endpoint enforces exactly the
  // same rules - otherwise a clean submission could be edited into anything afterwards.
  const parsed = parseProjectInput(req.body);
  if (parsed.error) {
    return res.status(400).json(parsed.error);
  }
  const fields = parsed.fields;

  // Rate limit here rather than at the top of the handler: this bucket exists to stop the Groq
  // moderation call below from being spammed, so a user fat-fingering the form shouldn't burn
  // their hourly budget on requests that never reach Groq. Admins are exempt (trusted accounts,
  // not the abuse this guards against), and the key includes the account id as well as the IP
  // so a shared campus NAT doesn't pool everyone into one bucket.
  if (!user.isAdmin) {
    if (!(await enforceRateLimit(res, 'submit', [clientIp(req), user._id.toString()]))) return;
  }

  // Cap active projects per account so the board doesn't get crowded by one user; admins are
  // exempt (trusted accounts, and they may need to post on behalf of others). Checked before
  // moderation, not after: a user who is already at the cap cannot succeed no matter what the
  // model says, so spending a Groq call to tell them that is pure waste - and they get the
  // useful "you're at the limit" answer immediately instead of after a round trip.
  if (!user.isAdmin) {
    try {
      const db = await getDb();
      const existingCount = await db.collection('projects').countDocuments({ userId: user._id });
      if (existingCount >= PROJECT_LIMIT) {
        return res.status(400).json({
          message: `You can only have ${PROJECT_LIMIT} active projects at a time. Delete one from your account to post another.`,
          stage: 'limit'
        });
      }
    } catch (error) {
      return sendError(res, 500, 'database', error);
    }
  }

  const moderation = await moderateProject(fields);
  if (moderation.error) {
    // A rejection is the user's to fix (400); the model being unreachable is ours (500).
    const isRejection = moderation.error.stage === 'moderation';
    return res.status(isRejection ? 400 : 500).json(moderation.error);
  }

  let newProject;
  try {
    const db = await getDb();
    const collection = db.collection('projects');

    newProject = {
      ...fields,
      authorName: fields.manager,
      userId: user._id,
      email: user.email, // Saved securely in DB, hidden from frontend
      createdAt: new Date()
    };

    await collection.insertOne(newProject);
  } catch (error) {
    return sendError(res, 500, 'database', error);
  }

  // Everything past this point is notification, and the project is already saved. A failure here
  // must not be reported as a failed submission: the old handler returned 502 when the admin
  // notification failed, so the user saw an error for a submission that had actually succeeded,
  // re-submitted, and burned another slot against their 3-project cap.
  const warnings = [];

  try {
    await sendMail({
      to: user.email,
      subject: `Your project "${fields.title}" was posted`,
      text: `Hi,\n\nYour project "${fields.title}" has been posted to the USB Research Resources project board.\n\n- USB Research Resources`
    });
  } catch (error) {
    console.error('[submit:notify]', error);
    warnings.push('confirmation email');
  }

  try {
    await notifyAdmin({ ...fields, submitterEmail: user.email });
  } catch (error) {
    console.error('[submit:notifyAdmin]', error);
    warnings.push('admin notification');
  }

  // Echo back the saved project minus the private fields, matching what /api/projects/mine
  // returns. The real _id lets the client render the new card without inventing a placeholder
  // id that would later fail to delete.
  const { email: _email, ...savedProject } = newProject;

  return res.status(200).json({
    message: 'Project permanently saved to database!',
    stage: 'ok',
    project: savedProject,
    ...(warnings.length ? { warning: `Project saved, but the ${warnings.join(' and ')} could not be sent.` } : {})
  });
});
