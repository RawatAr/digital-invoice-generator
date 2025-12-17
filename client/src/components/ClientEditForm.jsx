import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateClient } from '../store/clientSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

function ClientEditForm({ client, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        address: client.address || '',
        phone: client.phone || '',
      });
    }
  }, [client]);

  const { name, email, address, phone } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(updateClient({ clientId: client._id, clientData: formData }));
    onSave();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input id="name" name="name" value={name} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Client Email</Label>
        <Input id="email" name="email" type="email" value={email} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={address} onChange={onChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" value={phone} onChange={onChange} />
      </div>
      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  );
}

export default ClientEditForm;
