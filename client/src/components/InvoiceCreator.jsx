import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';

function InvoiceCreator() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-001',
    dueDate: new Date(),
    client: null,
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
    total: 0,
  });

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="h-full">
        <CardContent className="p-0">
          <InvoiceForm formData={invoiceData} setFormData={setInvoiceData} />
        </CardContent>
      </Card>
      <Card className="h-full">
        <CardContent className="p-0">
          <InvoicePreview invoiceData={invoiceData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default InvoiceCreator;
