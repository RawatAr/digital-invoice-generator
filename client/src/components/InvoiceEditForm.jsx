import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateInvoice } from '../store/invoiceSlice';
import { getClients } from '../store/clientSlice';
import { getItems } from '../store/itemSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/DatePicker';

function InvoiceEditForm({ invoice, onSave }) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    dueDate: null,
    client: '',
    items: [],
  });

  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.clients);
  const { items: allItems } = useSelector((state) => state.items);

  useEffect(() => {
    dispatch(getClients());
    dispatch(getItems());
  }, [dispatch]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
        client: invoice.client?._id || invoice.client || '',
        items: invoice.items.map(item => item._id || item) || [],
      });
    }
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.items.reduce((acc, itemId) => {
      const item = allItems.find((i) => i._id === itemId);
      return acc + (item ? item.price : 0);
    }, 0);

    const invoiceData = { ...formData, totalAmount };
    dispatch(updateInvoice({ invoiceId: invoice._id, invoiceData }));
    onSave();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input
          id="invoiceNumber"
          name="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label>Due Date</Label>
        <DatePicker date={formData.dueDate} setDate={(date) => setFormData(prev => ({...prev, dueDate: date}))} />
      </div>
      <div>
        <Label htmlFor="client">Client</Label>
        <Select onValueChange={(value) => handleSelectChange('client', value)} value={formData.client}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="items">Items</Label>
        <Select onValueChange={(value) => handleSelectChange('items', [value])} value={formData.items[0] || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            {allItems.map((i) => (
              <SelectItem key={i._id} value={i._id}>
                {i.description} - ${i.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  );
}

export default InvoiceEditForm;
