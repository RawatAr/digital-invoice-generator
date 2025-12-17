import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/state/auth.jsx';
import { useTheme } from '@/state/theme.jsx';
import { useCurrency } from '@/state/currency.jsx';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Clients' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

function Shell() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, supported, rate, ratesDate, ratesLoading } = useCurrency();

  const pageTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_15%_0%,rgba(34,197,94,0.28),rgba(7,10,18,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_85%_20%,rgba(139,92,246,0.22),rgba(7,10,18,0))]" />
      <div className="pointer-events-none absolute -left-24 top-40 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.24),rgba(7,10,18,0)_60%)] blur-2xl" />

      <header className="sticky top-0 z-10 border-b border-white/10 bg-[rgba(var(--surface),0.55)] backdrop-blur-xl">
        <div className="ds-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-ring">
              <span className="font-display text-sm font-semibold tracking-tight">DI</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold tracking-tight">Digital Invoice</div>
              <div className="text-xs text-white/55">Studio</div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="currency">
              Currency
            </label>
            <select
              id="currency"
              className="ds-input h-10 w-[92px]"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              title="Currency"
              aria-label="Currency"
            >
              {supported.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="hidden md:block text-[11px] font-semibold text-white/55">
              {currency === 'INR'
                ? 'Live FX'
                : ratesLoading
                  ? 'FX…'
                  : `1 INR ≈ ${Number(rate || 1).toFixed(4)} ${currency}${ratesDate ? ` · ${ratesDate}` : ''}`}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="ds-btn-secondary h-10 w-10 px-0"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M21 13.2A8.2 8.2 0 0 1 10.8 3a6.6 6.6 0 1 0 10.2 10.2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85">
                    {user?.name || 'Account'}
                  </div>
                  <button type="button" onClick={logout} className="ds-btn-danger h-10 px-3">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="ds-btn-secondary h-10 px-3">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="ds-btn-primary h-10 px-3">
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="ds-container py-10">
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
      </main>
    </div>
  );
}

export default Shell;
