import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { apiListInvoices } from '@/lib/invoicesApi';
import { useAuth } from '@/state/auth.jsx';
import { useMoney } from '@/lib/money.js';

function Reports() {
  const reduceMotion = useReducedMotion();
  const { token } = useAuth();
  const money = useMoney();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState([]);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    apiListInvoices(token)
      .then((data) => {
        if (cancelled) return;
        setInvoices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load reports');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => {
    const start = from ? new Date(from).getTime() : null;
    const end = to ? new Date(to).getTime() : null;

    return invoices.filter((inv) => {
      const ts = inv?.date ? new Date(inv.date).getTime() : 0;
      if (start && ts < start) return false;
      if (end && ts > end + 24 * 60 * 60 * 1000 - 1) return false;
      return true;
    });
  }, [invoices, from, to]);

  const summary = useMemo(() => {
    const now = Date.now();
    let total = 0;
    let paid = 0;
    let unpaid = 0;
    let overdue = 0;

    for (const inv of filtered) {
      const amount = Number(inv?.total || 0);
      total += amount;
      const status = String(inv?.status || 'pending').toLowerCase();
      const due = inv?.dueDate ? new Date(inv.dueDate).getTime() : 0;
      const isOverdue = status !== 'paid' && due && due < now;

      if (status === 'paid') {
        paid += amount;
      } else {
        unpaid += amount;
        if (isOverdue) overdue += amount;
      }
    }

    return { total, paid, unpaid, overdue, count: filtered.length };
  }, [filtered]);

  const byStatus = useMemo(() => {
    const map = new Map();
    for (const inv of filtered) {
      const s = String(inv?.status || 'pending').toLowerCase();
      map.set(s, (map.get(s) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  return (
    <div className="space-y-10">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-soft"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_0%,rgba(34,197,94,0.16),rgba(7,10,18,0))]" />
        <div className="relative space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Insights</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Reports</h1>
          <p className="max-w-2xl text-sm text-white/65">High-signal summaries backed by your invoices.</p>
        </div>
      </motion.div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="ds-panel overflow-hidden lg:col-span-2"
        >
          <div className="border-b border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Filter</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">Date range</div>
            <div className="mt-1 text-sm text-white/60">Uses invoice creation date (`invoice.date`).</div>
          </div>
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="from">From</label>
              <input id="from" className="ds-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="to">To</label>
              <input id="to" className="ds-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <button type="button" className="ds-btn-secondary w-full" onClick={() => { setFrom(''); setTo(''); }}>
              Clear
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="lg:col-span-3 space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="ds-panel p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Total invoiced</div>
              <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">{money.formatFromInr(summary.total)}</div>
              <div className="mt-1 text-sm text-white/60">Across <span className="font-semibold text-white/80 tabular-nums">{summary.count}</span> invoices</div>
            </div>
            <div className="ds-panel p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Paid</div>
              <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">{money.formatFromInr(summary.paid)}</div>
              <div className="mt-1 text-sm text-white/60">Settled amount</div>
            </div>
            <div className="ds-panel p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Unpaid</div>
              <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">{money.formatFromInr(summary.unpaid)}</div>
              <div className="mt-1 text-sm text-white/60">Pending + overdue</div>
            </div>
            <div className="ds-panel p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Overdue</div>
              <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">{money.formatFromInr(summary.overdue)}</div>
              <div className="mt-1 text-sm text-white/60">Past due date</div>
            </div>
          </div>

          <div className="ds-panel overflow-hidden">
            <div className="flex items-end justify-between gap-6 border-b border-white/10 bg-white/5 p-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Breakdown</div>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">Status counts</h2>
                <p className="mt-1 text-sm text-white/60">Simple, fast signal (no decorative charts).</p>
              </div>
              <div className="text-xs text-white/55">{isLoading ? 'Syncing…' : 'Live from API'}</div>
            </div>

            <div className="divide-y divide-white/10">
              {isLoading ? (
                <div className="p-6 text-sm text-white/60">Loading…</div>
              ) : byStatus.length ? (
                byStatus.map(([s, count]) => (
                  <div key={s} className="flex items-center justify-between p-6">
                    <div className="text-sm font-semibold text-white/85">{s}</div>
                    <div className="text-sm font-semibold tabular-nums text-white/85">{count}</div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-white/60">No invoices in this date range.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Reports;
