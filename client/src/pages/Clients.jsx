import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getClients, reset } from '../store/clientSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClientTable from '../components/ClientTable';

function Clients() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { clients, isLoading, isError, message } = useSelector((state) => state.clients);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate('/login');
    }
    dispatch(getClients());
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Manage Clients</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientTable clients={clients} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Clients;
