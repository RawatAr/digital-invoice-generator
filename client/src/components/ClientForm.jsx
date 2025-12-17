import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createClient } from '../store/clientSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

function ClientForm({ onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const { name, email, address, phone } = formData;

  const dispatch = useDispatch();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createClient({ name, email, address, phone }));
    setFormData({ name: '', email: '', address: '', phone: '' });
    if (onSave) {
      onSave();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input id="name" name="name" value={name} onChange={onChange} placeholder="Client's full name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Client Email</Label>
        <Input id="email" name="email" type="email" value={email} onChange={onChange} placeholder="Client's email address" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={address} onChange={onChange} placeholder="Client's address" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" value={phone} onChange={onChange} placeholder="Client's phone number" />
      </div>
      <Button type="submit" className="w-full">Add Client</Button>
    </form>
  );
}

export default ClientForm;
