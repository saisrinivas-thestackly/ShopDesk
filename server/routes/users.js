import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.put('/me', async (req, res) => {
  const user = req.user;
  const input = req.body ?? {};
  const errors = {};

  if (input.name !== undefined) {
    const name = String(input.name).trim();
    if (!name) errors.name = 'Name is required';
    else if (name.length > 60) errors.name = 'Name must be 60 characters or less';
    else user.name = name;
  }

  if (input.avatarUrl !== undefined) {
    const avatarUrl = String(input.avatarUrl).trim();
    if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) errors.avatarUrl = 'Avatar URL must start with http:// or https://';
    else user.avatarUrl = avatarUrl;
  }

  if (input.newPassword) {
    const newPassword = String(input.newPassword);
    const currentOk = input.currentPassword && (await bcrypt.compare(String(input.currentPassword), user.passwordHash));

    if (!currentOk) errors.currentPassword = 'Current password is incorrect';
    if (newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters';
    if (!errors.currentPassword && !errors.newPassword) user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(errors).length > 0) throw new HttpError(400, 'Please fix the highlighted fields', errors);

  await user.save();
  res.json({ user, message: 'Profile updated' });
});

export default router;
