import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { apiListClients } from '@/lib/clientsApi';
import { apiListItems } from '@/lib/itemsApi';
import { apiCreateInvoice } from '@/lib/invoicesApi';
import { useAuth } from '@/state/auth.jsx';
import { useMoney } from '@/lib/money.js';

function CreateInvoice() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { token } = useAuth();
  const money = useMoney();

  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    Promise.all([apiListClients(token), apiListItems(token)])
      .then(([cli, it]) => {
        if (cancelled) return;
        setClients(Array.isArray(cli) ? cli : []);
        setItems(Array.isArray(it) ? it : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load invoice dependencies');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const selectedItems = useMemo(() => {
    const byId = new Map(items.map((i) => [String(i._id), i]));
    return selectedItemIds.map((id) => byId.get(String(id))).filter(Boolean);
  }, [items, selectedItemIds]);

  const computedTotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.price || 0);
      return sum + qty * price;
    }, 0);
  }, [selectedItems]);

  const onToggleItem = (id) => {
    setSelectedItemIds((prev) => {
      const key = String(id);
      if (prev.includes(key)) return prev.filter((x) => x !== key);
      return [...prev, key];
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    if (!invoiceNumber.trim()) {
      setError('Please enter an invoice number');
      return;
    }

    if (!dueDate) {
      setError('Please choose a due date');
      return;
    }

    if (!selectedItemIds.length) {
      setError('Please select at least one item');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        client: selectedClientId,
        items: selectedItemIds,
        invoiceNumber: invoiceNumber.trim(),
        dueDate,
        total: computedTotal,
        status,
      };
      const created = await apiCreateInvoice(token, payload);
      navigate(`/invoices/${created._id}`);
    } catch (err) {
      setError(err?.message || 'Failed to create invoice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-soft"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_0%,rgba(34,211,238,0.18),rgba(7,10,18,0))]" />
        <div className="relative space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Invoice studio</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Create Invoice</h1>
          <p className="max-w-2xl text-sm text-white/65">
            Choose a client, pick line items, and ship a clean invoice in one pass.
          </p>
        </div>
      </motion.div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="ds-panel lg:col-span-3"
        >
          <div className="border-b border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Details</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">Invoice setup</div>
            <div className="mt-1 text-sm text-white/60">Fields match backend requirements.</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/85" htmlFor="invoiceNumber">
                  Invoice #
                </label>
                <input
                  id="invoiceNumber"
                  className="ds-input"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-1042"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/85" htmlFor="dueDate">
                  Due date
                </label>
                <input
                  id="dueDate"
                  className="ds-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/85" htmlFor="client">
                  Client
                </label>
                <select
                  id="client"
                  className="ds-input"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/85" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="ds-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white/85">Line items</div>
                  <div className="text-xs text-white/55">Select existing items from the backend catalog.</div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-white/85">{money.formatFromInr(computedTotal)}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30">
                <div className="max-h-[340px] overflow-auto divide-y divide-white/10">
                  {isLoading ? (
                    <div className="p-5 text-sm text-white/60">Loading items…</div>
                  ) : items.length ? (
                    items.map((it) => {
                      const id = String(it._id);
                      const checked = selectedItemIds.includes(id);
                      const lineTotal = Number(it.quantity || 0) * Number(it.price || 0);
                      return (
                        <label
                          key={id}
                          className="flex cursor-pointer items-start gap-3 p-5 hover:bg-white/5"
                        >
                          <input
                            className="mt-1 h-4 w-4 accent-emerald-400"
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleItem(id)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-white/85">{it.description}</div>
                            <div className="mt-1 text-xs text-white/55">
                              Qty <span className="tabular-nums">{it.quantity}</span> · Price{' '}
                              <span className="tabular-nums">{money.formatFromInr(it.price)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold tabular-nums text-white/85">{money.formatFromInr(lineTotal)}</div>
                            <div className="text-xs text-white/55">line</div>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="p-5 text-sm text-white/60">
                      No items found. Add items from the backend or seed the database.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className="ds-btn-primary w-full" type="submit" disabled={isSaving}>
              {isSaving ? 'Creating invoice…' : 'Create invoice'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="ds-panel lg:col-span-2"
        >
          <div className="border-b border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Summary</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">Review</div>
            <div className="mt-1 text-sm text-white/60">A clean, quick sanity check.</div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Client</div>
              <div className="mt-2 text-sm font-semibold text-white/85">
                {selectedClientId ? clients.find((c) => c._id === selectedClientId)?.name || 'Selected' : '—'}
              </div>
              <div className="mt-1 text-xs text-white/55">
                {selectedClientId ? clients.find((c) => c._id === selectedClientId)?.email || '' : 'Select a client'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Total</div>
              <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
                {money.formatFromInr(computedTotal)}
              </div>
              <div className="mt-1 text-xs text-white/55">Computed from selected items (qty × price)</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Due</div>
              <div className="mt-2 text-sm font-semibold text-white/85">{dueDate || '—'}</div>
              <div className="mt-1 text-xs text-white/55">Backend expects an ISO date</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Selected items</div>
              <div className="mt-2 text-sm font-semibold text-white/85 tabular-nums">{selectedItemIds.length}</div>
              <div className="mt-1 text-xs text-white/55">Choose at least one</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateInvoice;
