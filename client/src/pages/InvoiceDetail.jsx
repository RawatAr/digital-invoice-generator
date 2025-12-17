import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { sendInvoice } from '@/store/invoiceSlice';
import { mockInvoices } from '@/mocks/mockData';

function toISODateString(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
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

function getTotals(invoice) {
  const items = invoice?.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
  const taxTotal = items.reduce(
    (sum, item) => sum + (Number(item.taxPercent || 0) / 100) * Number(item.quantity || 0) * Number(item.rate || 0),
    0,
  );
  const discount = Number(invoice?.discount || 0);
  const extraCharges = Number(invoice?.extraCharges || 0);
  const total = Math.max(0, subtotal + taxTotal - discount + extraCharges);

  return { subtotal, taxTotal, discount, extraCharges, total };
}

function InvoiceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoiceId } = useParams();

  const { invoices } = useSelector((state) => state.invoices);

  const invoice = useMemo(() => {
    const fromState = location?.state?.invoice;
    if (fromState && fromState._id === invoiceId) return fromState;

    const fromStore = (invoices || []).find((inv) => inv._id === invoiceId);
    if (fromStore) return fromStore;

    return mockInvoices.find((inv) => inv._id === invoiceId) || null;
  }, [invoiceId, invoices, location?.state]);

  const totals = useMemo(() => getTotals(invoice), [invoice]);

  const status = (invoice?.status || 'draft').toLowerCase();

  const primaryAction =
    status === 'draft'
      ? 'send'
      : status === 'overdue'
        ? 'remind'
        : status === 'sent' || status === 'unpaid'
          ? 'mark_paid'
          : 'none';

  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [confirmPaidOpen, setConfirmPaidOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paidDate, setPaidDate] = useState(toISODateString(new Date()));

  const onConfirmSend = () => {
    if (!invoice) return;

    // TODO (backend): dispatch send action that changes status Draft -> Sent.
    // Guardrail: explicit confirmation is required.
    dispatch(sendInvoice(invoice._id));
    setConfirmSendOpen(false);
  };

  const onMarkPaidClick = () => {
    setPaidAmount(totals.total);
    setPaidDate(toISODateString(new Date()));
    setConfirmPaidOpen(true);
  };

  const onConfirmMarkPaid = () => {
    if (!invoice) return;

    // TODO (backend): mark invoice as paid.
    // Guardrail: explicit confirmation is required, capturing payment date and amount.
    setConfirmPaidOpen(false);
  };

  if (!invoice) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Invoice not found</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">Bill To: {invoice.client?.name || '-'}</p>
          <p className="text-sm text-muted-foreground">Amount due: {totals.total.toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-2">
          {primaryAction === 'send' && (
            <Button type="button" onClick={() => setConfirmSendOpen(true)}>
              Send Invoice
            </Button>
          )}
          {primaryAction === 'mark_paid' && (
            <Button type="button" onClick={onMarkPaidClick}>
              Mark as Paid
            </Button>
          )}
          {primaryAction === 'remind' && (
            <Button
              type="button"
              onClick={() => {
                // TODO (backend): send reminder for overdue invoice.
              }}
            >
              Send Reminder
            </Button>
          )}

          <Button
            variant="outline"
            type="button"
            onClick={() => {
              // TODO (backend): wire to PDF download endpoint.
            }}
          >
            Download PDF
          </Button>

          <Button variant="ghost" type="button" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">{invoice.client?.name || '-'}</p>
                <p className="text-sm text-muted-foreground">{invoice.client?.address || ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Dates</p>
                <p className="text-sm text-muted-foreground">Issue: {invoice.issueDate || '-'}</p>
                <p className="text-sm text-muted-foreground">Due: {invoice.dueDate || '-'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Items</h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-24">Rate</TableHead>
                      <TableHead className="w-20">Tax %</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(invoice.items || []).map((item, idx) => {
                      const base = Number(item.quantity || 0) * Number(item.rate || 0);
                      const tax = (Number(item.taxPercent || 0) / 100) * base;
                      const lineTotal = base + tax;

                      return (
                        <TableRow key={idx}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{Number(item.rate || 0).toFixed(2)}</TableCell>
                          <TableCell>{Number(item.taxPercent || 0).toFixed(0)}</TableCell>
                          <TableCell className="text-right">{lineTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {(invoice.notes || invoice.paymentInstructions) && (
            <Card className="p-6">
              <div className="space-y-4">
                {invoice.notes ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                ) : null}

                {invoice.paymentInstructions ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Payment instructions</p>
                    <p className="text-sm text-muted-foreground">{invoice.paymentInstructions}</p>
                  </div>
                ) : null}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Summary</p>
                <p className="text-xs text-muted-foreground">Totals are based on the invoice items.</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{totals.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount due</span>
                  <span className="text-lg font-semibold">{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the invoice to {invoice.client?.name || 'the client'}. Please review the amount and due date
              before sending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmSend}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPaidOpen} onOpenChange={setConfirmPaidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm payment details before updating the invoice status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="paidAmount">Amount paid</Label>
              <Input
                id="paidAmount"
                type="number"
                min={0}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paidDate">Payment date</Label>
              <Input id="paidDate" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmMarkPaid}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InvoiceDetail;
