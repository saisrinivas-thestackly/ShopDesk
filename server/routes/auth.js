import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, createToken } from '../middleware/auth.js';
import { EMAIL_PATTERN, User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.post('/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  if (Object.keys(errors).length > 0) throw new HttpError(400, 'Please fix the highlighted fields', errors);

  const user = await User.findOne({ email });
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));

  if (!passwordOk) throw new HttpError(401, 'Invalid email or password');

  res.json({ token: createToken(user), user });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
