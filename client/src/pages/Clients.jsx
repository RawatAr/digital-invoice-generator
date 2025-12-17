import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getClients, reset } from '../store/clientSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientTable from '../components/ClientTable';
import ClientForm from '../components/ClientForm';
import ClientEditForm from '../components/ClientEditForm';
import { mockClients } from '@/mocks/mockData';

function Clients() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [query, setQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { clients, isLoading, isError, message } = useSelector((state) => state.clients);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate('/login');
    }
    // TODO (backend): fetch clients from API and populate store.
    dispatch(getClients());
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  const rows = useMemo(() => {
    if (clients && clients.length > 0) return clients;
    if (isError) return mockClients;
    return clients || [];
  }, [clients, isError]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const company = (c.company || '').toLowerCase();
      return name.includes(q) || email.includes(q) || company.includes(q);
    });
  }, [query, rows]);

  const onEdit = (client) => {
    setSelectedClient(client);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage client records used for invoicing.</p>
        </div>
        <Button type="button" onClick={() => setIsAddOpen(true)}>
          Add Client
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="sm:max-w-sm"
        />
      </div>

      <ClientTable clients={filtered} isLoading={isLoading} onEdit={onEdit} />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
          </DialogHeader>
          <ClientForm onSave={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
          </DialogHeader>
          <ClientEditForm client={selectedClient} onSave={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Clients;
