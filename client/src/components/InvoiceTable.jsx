import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { sendInvoice } from '../store/invoiceSlice';
import { toast } from 'sonner';
import InvoiceEditForm from './InvoiceEditForm';
import { MoreHorizontal } from 'lucide-react';
import invoiceService from '@/services/invoiceService';

function InvoiceTable({ invoices, isLoading }) {
  const [filter, setFilter] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleDownload = async (invoice) => {
    try {
      const blob = await invoiceService.downloadInvoice(invoice._id, user.token);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleSendClick = (invoice) => {
    setInvoiceToSend(invoice);
    setIsSendDialogOpen(true);
  };

  const handleSendConfirm = () => {
    if (invoiceToSend) {
      dispatch(sendInvoice(invoiceToSend._id))
        .unwrap()
        .then(() => {
          toast.success(`Invoice sent to ${invoiceToSend.client.name}`);
        })
        .catch((error) => {
          toast.error(`Failed to send invoice: ${error}`);
        });
      setIsSendDialogOpen(false);
      setInvoiceToSend(null);
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Input
        placeholder="Filter by invoice number..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6"
      />
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Invoice Number</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <TableRow key={invoice._id} className="odd:bg-muted/20 hover:bg-accent/30 transition-colors">
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.client.name}</TableCell>
                <TableCell>${Number(invoice.total).toFixed(2)}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(invoice)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(invoice)}>Download PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendClick(invoice)}>Send Email</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <InvoiceEditForm invoice={selectedInvoice} onSave={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the invoice to {invoiceToSend?.client.name} at {invoiceToSend?.client.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendConfirm}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InvoiceTable;
