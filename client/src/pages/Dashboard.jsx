import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getInvoices, reset } from '../store/invoiceSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceCreator from '../components/InvoiceCreator';
import InvoiceTable from '../components/InvoiceTable';
import DashboardAnalytics from '../components/DashboardAnalytics';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { invoices, isLoading, isError, message } = useSelector((state) => state.invoices);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate('/login');
    }
    dispatch(getInvoices());
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome {user && user.name}</h1>
        <p className="text-muted-foreground">Create, manage and send invoices with ease.</p>
      </div>
      <DashboardAnalytics invoices={invoices} />
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="bg-muted/50 rounded-lg p-1">
          <TabsTrigger value="invoices">View Invoices</TabsTrigger>
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <Card className="shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle>Your Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={invoices} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create">
          <Card className="shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle>Create a New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceCreator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Dashboard;
