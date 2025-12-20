import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/state/auth.jsx';

function Register() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const transition = useMemo(
    () => (reduceMotion ? undefined : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }),
    [reduceMotion],
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.section
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={transition}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
            Create your workspace
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Start invoicing in minutes</h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/65">
            A premium invoice flow: clean creation, clear totals, and a dashboard that prioritizes signal.
          </p>
        </motion.section>

        <motion.section
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
          className="ds-panel overflow-hidden"
        >
          <div className="border-b border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Account</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">Create account</div>
            <div className="mt-1 text-sm text-white/60">Your details are stored securely in MongoDB.</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="ds-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aryan"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="ds-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/85" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="ds-input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/85" htmlFor="confirm">
                  Confirm
                </label>
                <input
                  id="confirm"
                  className="ds-input"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button className="ds-btn-primary w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <div className="text-white/60">Already have an account?</div>
              <Link to="/login" className="font-semibold text-white hover:text-white/80">
                Sign in
              </Link>
            </div>
          </form>
        </motion.section>
      </div>
    </div>
  );
}

export default Register;
