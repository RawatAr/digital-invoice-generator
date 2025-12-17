import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getInvoices } from '@/store/invoiceSlice';
import InvoiceListTable from '@/components/InvoiceListTable';
import { mockInvoices } from '@/mocks/mockData';

function computeTotals(invoices) {
  const getTotal = (inv) => {
    const items = inv?.items || [];
    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
    const taxTotal = items.reduce(
      (sum, item) => sum + (Number(item.taxPercent || 0) / 100) * Number(item.quantity || 0) * Number(item.rate || 0),
      0,
    );
    const discount = Number(inv?.discount || 0);
    const extraCharges = Number(inv?.extraCharges || 0);
    return Math.max(0, subtotal + taxTotal - discount + extraCharges);
  };

  const byStatus = invoices.reduce(
    (acc, inv) => {
      const status = (inv.status || 'draft').toLowerCase();
      const total = getTotal(inv);
      acc.totalInvoiced += total;

      if (status === 'overdue') {
        acc.overdue += total;
        acc.outstanding += total;
      } else if (status === 'unpaid' || status === 'sent') {
        acc.outstanding += total;
      } else if (status === 'paid') {
        acc.paid += total;
      }

      return acc;
    },
    { outstanding: 0, overdue: 0, paid: 0, totalInvoiced: 0 },
  );

  return byStatus;
}

function money(amount) {
  // TODO (backend): use the business default currency (Settings) once available.
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function Reports() {
  const dispatch = useDispatch();
  const { invoices, isLoading, isError } = useSelector((state) => state.invoices);

  const [dateRange, setDateRange] = useState('last_30_days');

  useEffect(() => {
    // TODO (backend): fetch invoices for the selected date range.
    // Guardrail: the totals and table on this page must always reflect the selected range.
    dispatch(getInvoices());
  }, [dispatch, dateRange]);

  const rows = useMemo(() => {
    if (isError && (!invoices || invoices.length === 0)) return mockInvoices;
    return invoices || [];
  }, [invoices, isError]);

  const totals = useMemo(() => computeTotals(rows), [rows]);

  const onExportCsv = () => {
    // TODO (backend): server-generated CSV export. For now, this is a stub.
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">All numbers below reflect the selected date range.</p>
        </div>
        <Button type="button" onClick={onExportCsv}>
          Export (CSV)
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Date range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
                <SelectItem value="last_month">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Outstanding total</p>
          <p className="mt-2 text-2xl font-semibold">{money(totals.outstanding)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Overdue total</p>
          <p className="mt-2 text-2xl font-semibold">{money(totals.overdue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Paid total</p>
          <p className="mt-2 text-2xl font-semibold">{money(totals.paid)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total invoiced</p>
          <p className="mt-2 text-2xl font-semibold">{money(totals.totalInvoiced)}</p>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Invoice breakdown</h2>
        <InvoiceListTable invoices={rows} isLoading={isLoading} emptyMessage="No invoices for this period." />
      </div>
    </div>
  );
}

export default Reports;
