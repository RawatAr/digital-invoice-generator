import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateItem } from '../store/itemSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

function ItemEditForm({ item, onSave }) {
  const [formData, setFormData] = useState({
    description: '',
    price: '',
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (item) {
      setFormData({
        description: item.description || '',
        price: item.price || '',
      });
    }
  }, [item]);

  const { description, price } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(updateItem({ itemId: item._id, itemData: { description, price: parseFloat(price) } }));
    onSave();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Item Description</Label>
        <Input id="description" name="description" value={description} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" value={price} onChange={onChange} required />
      </div>
      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  );
}

export default ItemEditForm;
