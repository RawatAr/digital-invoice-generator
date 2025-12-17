import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getItems, reset } from '../store/itemSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ItemTable from '../components/ItemTable';

function Items() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items, isLoading, isError, message } = useSelector((state) => state.items);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate('/login');
    }
    dispatch(getItems());
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Manage Items</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemTable items={items} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Items;
