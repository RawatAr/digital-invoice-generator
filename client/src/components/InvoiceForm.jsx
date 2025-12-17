import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createInvoice } from '../store/invoiceSlice';
import { getClients } from '../store/clientSlice';
import { getItems } from '../store/itemSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/DatePicker';
import { Textarea } from './ui/textarea';
import { Trash2 } from 'lucide-react';

function InvoiceForm({ formData, setFormData }) {
  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.clients);

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  useEffect(() => {
    const newTotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    setFormData(prev => ({ ...prev, total: newTotal }));
  }, [formData.items, setFormData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index][name] = value;
    setFormData(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, price: 0 }] }));
  };

  const removeItem = (index) => {
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData(prev => ({ ...prev, items }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const invoicePayload = {
      ...formData,
      client: formData.client?._id,
      items: formData.items.map(item => ({...item})) // Ensure items are plain objects
    };
    dispatch(createInvoice(invoicePayload));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6 bg-card text-card-foreground rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleFormChange} />
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <DatePicker date={formData.dueDate} setDate={(date) => setFormData(prev => ({ ...prev, dueDate: date }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, client: clients.find(c => c._id === value) }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Items</Label>
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input name="description" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, e)} className="flex-grow" />
              <Input name="quantity" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="w-20" />
              <Input name="price" type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(index, e)} className="w-24" />
              <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            Add Item
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="e.g., Thank you for your business" value={formData.notes} onChange={handleFormChange} />
      </div>

      <Button type="submit" className="w-full">Create Invoice</Button>
    </form>
  );
}

export default InvoiceForm;
