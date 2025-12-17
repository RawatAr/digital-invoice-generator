import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { mockClients } from '@/mocks/mockData';

function toISODateString(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function CreateInvoice() {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);

  const [form, setForm] = useState({
    clientId: '',
    invoiceNumber: 'INV-2025-001',
    issueDate: toISODateString(today),
    dueDate: toISODateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15)),
    currency: 'USD',
    paymentTerms: 'Net 15',
    billFromName: '',
    billFromAddress: '',
    items: [{ description: '', quantity: 1, rate: 0, taxPercent: 0 }],
    discount: 0,
    extraCharges: 0,
    notes: '',
    paymentInstructions: '',
    internalMemo: '',
  });

  const [errors, setErrors] = useState({});

  const selectedClient = useMemo(
    () => mockClients.find((c) => c._id === form.clientId) || null,
    [form.clientId],
  );

  const totals = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
      0,
    );
    const taxTotal = form.items.reduce(
      (sum, item) =>
        sum + (Number(item.taxPercent || 0) / 100) * Number(item.quantity || 0) * Number(item.rate || 0),
      0,
    );

    const discount = Number(form.discount || 0);
    const extraCharges = Number(form.extraCharges || 0);

    const total = Math.max(0, subtotal + taxTotal - discount + extraCharges);

    return { subtotal, taxTotal, total };
  }, [form.discount, form.extraCharges, form.items]);

  const updateItem = (index, patch) => {
    setForm((prev) => {
      const next = { ...prev };
      next.items = prev.items.map((row, i) => (i === index ? { ...row, ...patch } : row));
      return next;
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, taxPercent: 0 }],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.clientId) nextErrors.clientId = 'Select a client to continue.';
    if (!form.invoiceNumber?.trim()) nextErrors.invoiceNumber = 'Invoice number is required.';
    if (!form.issueDate) nextErrors.issueDate = 'Issue date is required.';
    if (!form.dueDate) nextErrors.dueDate = 'Due date is required.';
    if (form.issueDate && form.dueDate && form.dueDate < form.issueDate) {
      nextErrors.dueDate = 'Due date must be the same as or after the issue date.';
    }
    if (!form.currency) nextErrors.currency = 'Currency is required.';
    if (!form.billFromName?.trim()) nextErrors.billFromName = 'Business name is required.';

    if (!Array.isArray(form.items) || form.items.length === 0) {
      nextErrors.items = 'Add at least one line item.';
    } else {
      const itemErrors = form.items.map((item) => {
        const rowErrors = {};
        if (!item.description || item.description.trim().length < 2) rowErrors.description = 'Enter an item description.';
        if (Number(item.quantity || 0) <= 0) rowErrors.quantity = 'Quantity must be greater than 0.';
        if (Number(item.rate ?? 0) < 0) rowErrors.rate = 'Rate must be 0 or greater.';
        const tax = Number(item.taxPercent ?? 0);
        if (tax < 0 || tax > 100) rowErrors.taxPercent = 'Tax must be between 0 and 100.';
        return rowErrors;
      });

      if (itemErrors.some((r) => Object.keys(r).length > 0)) nextErrors.itemRows = itemErrors;
    }

    if (Number(form.discount || 0) < 0) nextErrors.discount = 'Discount must be 0 or greater.';
    if (Number(form.extraCharges || 0) < 0) nextErrors.extraCharges = 'Additional charges must be 0 or greater.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSaveInvoice = () => {
    // TODO (backend): Save Invoice creates/updates a DRAFT by default.
    // Must validate required fields and persist to API.
    if (!validate()) return;

    const draftInvoice = {
      _id: `draft_${Date.now()}`,
      invoiceNumber: form.invoiceNumber,
      status: 'draft',
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      currency: form.currency,
      paymentTerms: form.paymentTerms,
      client: selectedClient,
      items: form.items,
      discount: form.discount,
      extraCharges: form.extraCharges,
      notes: form.notes,
      paymentInstructions: form.paymentInstructions,
      internalMemo: form.internalMemo,
      updatedAt: new Date().toISOString(),
    };

    // TODO (backend): after save success, redirect to Invoice Detail view.
    navigate(`/invoices/${draftInvoice._id}`, { state: { invoice: draftInvoice } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-sm text-muted-foreground">Status: Draft</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button">
            Preview
          </Button>
          <Button variant="ghost" type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="button" onClick={onSaveInvoice}>
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Client (Bill To) *</Label>
                  <Select value={form.clientId} onValueChange={(value) => setForm((p) => ({ ...p, clientId: value }))}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId ? <p className="text-sm text-destructive">{errors.clientId}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={form.invoiceNumber}
                    onChange={(e) => setForm((p) => ({ ...p, invoiceNumber: e.target.value }))}
                    required
                  />
                  {errors.invoiceNumber ? <p className="text-sm text-destructive">{errors.invoiceNumber}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
                    required
                  />
                  {errors.issueDate ? <p className="text-sm text-destructive">{errors.issueDate}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                    required
                  />
                  {errors.dueDate ? <p className="text-sm text-destructive">{errors.dueDate}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={form.currency} onValueChange={(value) => setForm((p) => ({ ...p, currency: value }))}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currency ? <p className="text-sm text-destructive">{errors.currency}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment terms</Label>
                  <Input
                    id="paymentTerms"
                    value={form.paymentTerms}
                    onChange={(e) => setForm((p) => ({ ...p, paymentTerms: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billFromName">Bill From (Your business) *</Label>
                  <Input
                    id="billFromName"
                    value={form.billFromName}
                    onChange={(e) => setForm((p) => ({ ...p, billFromName: e.target.value }))}
                    placeholder="Your business name"
                    required
                  />
                  {errors.billFromName ? <p className="text-sm text-destructive">{errors.billFromName}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billFromAddress">Your business address</Label>
                  <Input
                    id="billFromAddress"
                    value={form.billFromAddress}
                    onChange={(e) => setForm((p) => ({ ...p, billFromAddress: e.target.value }))}
                    placeholder="Street, city, country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Items *</Label>
                {errors.items ? <p className="text-sm text-destructive">{errors.items}</p> : null}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-28">Rate</TableHead>
                        <TableHead className="w-24">Tax %</TableHead>
                        <TableHead className="w-28 text-right">Line total</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map((row, idx) => {
                        const rowErrors = Array.isArray(errors.itemRows) ? errors.itemRows[idx] : null;
                        const lineSubtotal = Number(row.quantity || 0) * Number(row.rate || 0);
                        const lineTax = (Number(row.taxPercent || 0) / 100) * lineSubtotal;
                        const lineTotal = lineSubtotal + lineTax;

                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <Input
                                value={row.description}
                                onChange={(e) => updateItem(idx, { description: e.target.value })}
                                placeholder="Item description"
                              />
                              {rowErrors?.description ? (
                                <p className="mt-1 text-xs text-destructive">{rowErrors.description}</p>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                value={row.quantity}
                                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                              />
                              {rowErrors?.quantity ? (
                                <p className="mt-1 text-xs text-destructive">{rowErrors.quantity}</p>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                value={row.rate}
                                onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })}
                              />
                              {rowErrors?.rate ? <p className="mt-1 text-xs text-destructive">{rowErrors.rate}</p> : null}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={row.taxPercent}
                                onChange={(e) => updateItem(idx, { taxPercent: Number(e.target.value) })}
                              />
                              {rowErrors?.taxPercent ? (
                                <p className="mt-1 text-xs text-destructive">{rowErrors.taxPercent}</p>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {lineTotal.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                type="button"
                                className="h-8 w-8 px-0"
                                onClick={() => removeItem(idx)}
                                disabled={form.items.length === 1}
                              >
                                ×
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" type="button" onClick={addItem}>
                  Add line item
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    value={form.discount}
                    onChange={(e) => setForm((p) => ({ ...p, discount: Number(e.target.value) }))}
                  />
                  {errors.discount ? <p className="text-sm text-destructive">{errors.discount}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraCharges">Shipping / Additional charges</Label>
                  <Input
                    id="extraCharges"
                    type="number"
                    min={0}
                    value={form.extraCharges}
                    onChange={(e) => setForm((p) => ({ ...p, extraCharges: Number(e.target.value) }))}
                  />
                  {errors.extraCharges ? <p className="text-sm text-destructive">{errors.extraCharges}</p> : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes to client</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentInstructions">Payment instructions</Label>
                  <Textarea
                    id="paymentInstructions"
                    value={form.paymentInstructions}
                    onChange={(e) => setForm((p) => ({ ...p, paymentInstructions: e.target.value }))}
                    placeholder="Optional payment instructions"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalMemo">Internal memo</Label>
                <Textarea
                  id="internalMemo"
                  value={form.internalMemo}
                  onChange={(e) => setForm((p) => ({ ...p, internalMemo: e.target.value }))}
                  placeholder="Internal only (not shown on invoice)"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Summary</p>
                <p className="text-xs text-muted-foreground">Totals update as you edit items.</p>
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

              <div className="text-xs text-muted-foreground">
                {selectedClient ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Bill To</p>
                    <p>{selectedClient.name}</p>
                    <p>{selectedClient.email}</p>
                  </div>
                ) : (
                  <p>Select a client to see billing details.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateInvoice;
