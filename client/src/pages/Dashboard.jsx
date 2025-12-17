import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getInvoices, reset } from '../store/invoiceSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InvoiceListTable from '@/components/InvoiceListTable';
import { mockInvoices } from '@/mocks/mockData';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { invoices, isLoading, isError, message } = useSelector((state) => state.invoices);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate('/login');
    }
    // TODO (backend): fetch invoices from API and populate store.
    dispatch(getInvoices());
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  const rows = useMemo(() => {
    if (invoices && invoices.length > 0) return invoices;
    if (isError) return mockInvoices;
    return invoices || [];
  }, [invoices, isError]);

  const summary = useMemo(() => {
    const normalized = rows.map((inv) => ({ ...inv, status: (inv.status || 'draft').toLowerCase() }));

    const overdue = normalized.filter((i) => i.status === 'overdue').length;
    const unpaid = normalized.filter((i) => i.status === 'unpaid' || i.status === 'sent').length;
    const paid = normalized.filter((i) => i.status === 'paid').length;
    const total = normalized.length;

    return { overdue, unpaid, paid, total };
  }, [rows]);

  const recentInvoices = useMemo(() => {
    const normalized = rows.map((inv) => ({ ...inv, status: (inv.status || 'draft').toLowerCase() }));
    const priority = (status) => {
      if (status === 'overdue') return 0;
      if (status === 'unpaid' || status === 'sent') return 1;
      if (status === 'paid') return 2;
      return 3;
    };

    return [...normalized]
      .sort((a, b) => {
        const p = priority(a.status) - priority(b.status);
        if (p !== 0) return p;
        const aTime = new Date(a.updatedAt || a.issueDate || 0).getTime();
        const bTime = new Date(b.updatedAt || b.issueDate || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 10);
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Review what needs attention and take action.</p>
        </div>
        <Button type="button" onClick={() => navigate('/invoices/new')}>
          Create Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="mt-2 text-2xl font-semibold">{summary.overdue}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Unpaid</p>
          <p className="mt-2 text-2xl font-semibold">{summary.unpaid}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="mt-2 text-2xl font-semibold">{summary.paid}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total invoices</p>
          <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Recent invoices</h2>
        <InvoiceListTable invoices={recentInvoices} isLoading={isLoading} emptyMessage="No invoices yet." />
      </div>
    </div>
  );
}

export default Dashboard;
