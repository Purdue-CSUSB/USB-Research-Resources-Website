import { methodGuard, withErrorHandling } from '../../backend/lib/http.js';
import { publicUser, requireAuth } from '../../backend/lib/auth.js';

export default withErrorHandling('auth:me', async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;

  // requireAuth already re-reads the account from Mongo, so this is the live user, not a
  // snapshot from the token.
  const user = await requireAuth(req, res);
  if (!user) return;

  return res.status(200).json({ user: publicUser(user) });
});
