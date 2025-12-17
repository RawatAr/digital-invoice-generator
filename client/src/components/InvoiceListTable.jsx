import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `$${Number(amount || 0).toFixed(2)}`;
  }
}

function getAmountTotals(invoice) {
  const items = invoice?.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
  const taxTotal = items.reduce(
    (sum, item) => sum + (Number(item.taxPercent || 0) / 100) * Number(item.quantity || 0) * Number(item.rate || 0),
    0,
  );

  const discount = Number(invoice?.discount || 0);
  const extraCharges = Number(invoice?.extraCharges || 0);

  const total = Math.max(0, subtotal + taxTotal - discount + extraCharges);
  return { subtotal, taxTotal, total };
}

function StatusBadge({ status }) {
  const label = (status || 'draft').toString();

  const className =
    label === 'paid'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : label === 'overdue'
        ? 'bg-red-50 text-red-700 ring-red-200'
        : label === 'sent'
          ? 'bg-blue-50 text-blue-700 ring-blue-200'
          : label === 'unpaid'
            ? 'bg-amber-50 text-amber-700 ring-amber-200'
            : 'bg-slate-50 text-slate-700 ring-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {label}
    </span>
  );
}

function InvoiceListTable({ invoices, isLoading, emptyMessage = 'No invoices found.' }) {
  const navigate = useNavigate();

  const rows = useMemo(() => invoices || [], [invoices]);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="hidden sm:table-cell">Due date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((invoice) => {
              const { total } = getAmountTotals(invoice);

              return (
                <TableRow
                  key={invoice._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice._id}`)}
                >
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client?.name || '-'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{invoice.dueDate || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(total, invoice.currency)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => navigate(`/invoices/${invoice._id}`)}>View</DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            // TODO (backend): wire to PDF download endpoint.
                          }}
                        >
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default InvoiceListTable;
