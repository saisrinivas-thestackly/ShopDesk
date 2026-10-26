import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { validateLogin } from '../utils/validation';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/layout/Logo';
import { AlertIcon, EyeIcon, EyeOffIcon, TrendUpIcon } from '../components/ui/icons';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (user) return <Navigate to={from} replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Log in to manage your store's products and orders.</p>
          {apiError && (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-control bg-danger/10 p-3 text-sm text-danger">
              <AlertIcon size={18} className="shrink-0" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="cursor-pointer rounded p-1 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              }
            />
            <Button type="submit" loading={submitting} className="w-full">
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
          <p className="mt-6 rounded-control bg-hover p-3 text-xs text-muted">
            Demo login: <span className="font-medium text-ink">admin@shopdesk.dev</span> /{' '}
            <span className="font-medium text-ink">Admin@123</span>
          </p>
        </div>
      </div>
      <div className="hidden flex-col justify-center gap-6 bg-card p-16 lg:flex">
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">Your store, at a glance.</h2>
          <p className="mt-3 text-muted">Track orders, keep stock healthy and see revenue grow, all from one desk.</p>
        </div>
        <div className="grid max-w-md grid-cols-2 gap-4 text-brand">
          <div className="rounded-card bg-stat-purple p-6">
            <p className="text-sm font-semibold">Orders</p>
            <p className="mt-2 flex items-center justify-between text-2xl font-semibold">
              50 <span className="flex items-center gap-1 text-xs font-normal">+12% <TrendUpIcon size={16} /></span>
            </p>
          </div>
          <div className="rounded-card bg-stat-blue p-6">
            <p className="text-sm font-semibold">Products</p>
            <p className="mt-2 text-2xl font-semibold">30</p>
          </div>
        </div>
      </div>
    </div>
  );
}
