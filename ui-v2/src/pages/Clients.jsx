import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { apiCreateClient, apiDeleteClient, apiListClients, apiUpdateClient } from '@/lib/clientsApi';
import { useAuth } from '@/state/auth.jsx';

function Clients() {
  const reduceMotion = useReducedMotion();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setAddress('');
    setPhone('');
  };

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiListClients(token);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sorted = useMemo(() => {
    return [...clients].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
  }, [clients]);

  const onEdit = (client) => {
    setEditingId(client._id);
    setName(client.name || '');
    setEmail(client.email || '');
    setAddress(client.address || '');
    setPhone(client.phone || '');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), address: address.trim(), phone: phone.trim() };
      if (editingId) {
        await apiUpdateClient(token, editingId, payload);
      } else {
        await apiCreateClient(token, payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to save client');
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (id) => {
    setError('');
    try {
      await apiDeleteClient(token, id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to delete client');
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_0%,rgba(139,92,246,0.18),rgba(7,10,18,0))]" />
        <div className="relative space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Directory</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Clients</h1>
          <p className="max-w-2xl text-sm text-white/65">Create, edit, and maintain a clean client list used across invoices.</p>
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
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Editor</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {editingId ? 'Edit client' : 'New client'}
            </div>
            <div className="mt-1 text-sm text-white/60">Fields align with backend validation (name + email required).</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="name">Name</label>
              <input id="name" className="ds-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="email">Email</label>
              <input
                id="email"
                className="ds-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="address">Address</label>
              <input id="address" className="ds-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/85" htmlFor="phone">Phone</label>
              <input id="phone" className="ds-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <button className="ds-btn-primary w-full" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Create client'}
            </button>

            {editingId ? (
              <button type="button" className="ds-btn-secondary w-full" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </form>
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="ds-panel overflow-hidden lg:col-span-3"
        >
          <div className="flex items-end justify-between gap-6 border-b border-white/10 bg-white/5 p-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">List</div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">All clients</h2>
              <p className="mt-1 text-sm text-white/60">Connected to <span className="text-white/75">/api/clients</span>.</p>
            </div>
            <div className="text-xs text-white/55">{isLoading ? 'Syncing…' : `${sorted.length} total`}</div>
          </div>

          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-6 text-sm text-white/60">Loading…</div>
            ) : sorted.length ? (
              sorted.map((c) => (
                <div key={c._id} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white/85 truncate">{c.name}</div>
                    <div className="mt-1 text-xs text-white/55 truncate">{c.email}</div>
                    {(c.address || c.phone) ? (
                      <div className="mt-2 text-xs text-white/45 truncate">{[c.phone, c.address].filter(Boolean).join(' · ')}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="ds-btn-secondary h-10 px-3" onClick={() => onEdit(c)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ds-btn-secondary h-10 px-3"
                      onClick={() => onDelete(c._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-white/60">No clients yet. Create one to start invoicing.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Clients;
