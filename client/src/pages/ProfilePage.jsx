import { useState } from 'react';
import { getMe, updateMe } from '../api';
import { getErrorMessage, getFieldErrors } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import DataState from '../components/ui/DataState';
import { validatePasswordChange, validateProfileName } from '../utils/validation';
import { formatDate } from '../utils/format';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ProfilePage() {
  const toast = useToast();
  const { setUser } = useAuth();
  const { data: user, setData, loading, error, reload } = useApi(() => getMe(), []);

  const [editedDetails, setDetails] = useState(null);
  const details = editedDetails ?? { name: user?.name || '', avatarUrl: user?.avatarUrl || '' };
  const [detailErrors, setDetailErrors] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const applyUser = (updated) => {
    setData(updated);
    setUser(updated);
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    const found = validateProfileName(details);
    if (details.avatarUrl.trim() && !/^https?:\/\//i.test(details.avatarUrl.trim())) {
      found.avatarUrl = 'Avatar URL must start with http:// or https://';
    }
    setDetailErrors(found);
    if (Object.keys(found).length > 0) return;

    setSavingDetails(true);
    try {
      const { user: updated } = await updateMe({ name: details.name.trim(), avatarUrl: details.avatarUrl.trim() });
      applyUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      setDetailErrors(getFieldErrors(err));
      toast.error(`Could not update profile: ${getErrorMessage(err)}`);
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const found = validatePasswordChange(passwords);
    setPasswordErrors(found);
    if (Object.keys(found).length > 0) return;

    setSavingPassword(true);
    try {
      const { user: updated } = await updateMe({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      applyUser(updated);
      setPasswords(EMPTY_PASSWORDS);
      toast.success('Password changed');
    } catch (err) {
      setPasswordErrors(getFieldErrors(err));
      toast.error(`Could not change password: ${getErrorMessage(err)}`);
    } finally {
      setSavingPassword(false);
    }
  };

  const onDetailChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
    setDetailErrors({ ...detailErrors, [e.target.name]: '' });
  };
  const onPasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
  };

  return (
    <>
      <PageHeader title="Profile" description="Your account details" />
      <DataState loading={loading} error={error} onRetry={reload} isEmpty={!user} loadingRows={6}>
        {user && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-7">
            <Card className="flex flex-col items-center text-center lg:self-start">
              <Avatar name={user.name} src={user.avatarUrl} size={88} />
              <p className="mt-4 text-base font-semibold">{user.name}</p>
              <p className="mt-1 text-sm break-all text-muted">{user.email}</p>
              <p className="mt-4 rounded-full bg-stat-blue px-3 py-1 text-xs text-brand">Admin</p>
              <p className="mt-4 text-xs text-muted">Member since {formatDate(user.createdAt)}</p>
            </Card>
            <div className="space-y-4 lg:col-span-2 md:space-y-7">
              <Card title="Edit profile">
                <form onSubmit={saveDetails} noValidate className="space-y-4">
                  <Input label="Name" name="name" value={details.name} onChange={onDetailChange} error={detailErrors.name} autoComplete="name" />
                  <Input label="Email" value={user.email} disabled hint="Email can't be changed." />
                  <Input
                    label="Avatar URL (optional)"
                    name="avatarUrl"
                    type="url"
                    value={details.avatarUrl}
                    onChange={onDetailChange}
                    error={detailErrors.avatarUrl}
                    placeholder="https://..."
                    hint="Leave empty to show your initials."
                  />
                  <div className="flex justify-end">
                    <Button type="submit" loading={savingDetails}>
                      Save changes
                    </Button>
                  </div>
                </form>
              </Card>
              <Card title="Change password">
                <form onSubmit={savePassword} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    className="sm:col-span-2"
                    label="Current password"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={onPasswordChange}
                    error={passwordErrors.currentPassword}
                  />
                  <Input
                    label="New password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={onPasswordChange}
                    error={passwordErrors.newPassword}
                    hint="At least 8 characters."
                  />
                  <Input
                    label="Confirm new password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={onPasswordChange}
                    error={passwordErrors.confirmPassword}
                  />
                  <div className="flex justify-end sm:col-span-2">
                    <Button type="submit" loading={savingPassword}>
                      Change password
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}
      </DataState>
    </>
  );
}
