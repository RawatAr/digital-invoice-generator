import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

import { useSelector } from 'react-redux';

function InvoicePreview({ invoiceData }) {
  const { user } = useSelector((state) => state.auth);
  const { invoiceNumber, dueDate, client, items, notes, total } = invoiceData;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Invoice Preview</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="grid gap-4">
          <div className="flex justify-between">
            <div>
              {user?.companyLogo && <img src={`/${user.companyLogo}`} alt="Company Logo" className="w-24 h-auto" />}
              <h3 className="font-semibold">{user?.companyName || 'Your Company'}</h3>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-lg">Invoice</h3>
              <p>#{invoiceNumber}</p>
              <p>Due: {dueDate.toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Bill To:</h4>
            {client ? (
              <>
                <p>{client.name}</p>
                <p>{client.address}</p>
                <p>{client.email}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Select a client</p>
            )}
          </div>
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-4 font-semibold">
              <div>Item</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Rate</div>
              <div className="text-right">Amount</div>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 mt-2">
                <div>{item.description || '...'}</div>
                <div className="text-center">{item.quantity}</div>
                <div className="text-right">${item.price.toFixed(2)}</div>
                <div className="text-right">${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-end">
            <div className="w-1/2">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {notes && (
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold">Notes</h4>
              <p className="text-muted-foreground">{notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default InvoicePreview;
