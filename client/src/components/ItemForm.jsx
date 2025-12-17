import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createItem } from '../store/itemSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

function ItemForm({ onSave }) {
  const [formData, setFormData] = useState({
    description: '',
    price: '',
  });

  const { description, price } = formData;

  const dispatch = useDispatch();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createItem({ description, price: parseFloat(price) }));
    setFormData({ description: '', price: '' });
    if (onSave) {
      onSave();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Item Description</Label>
        <Input id="description" name="description" value={description} onChange={onChange} placeholder="e.g., Web Design Service" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" value={price} onChange={onChange} placeholder="e.g., 100.00" required />
      </div>
      <Button type="submit" className="w-full">Add Item</Button>
    </form>
  );
}

export default ItemForm;
