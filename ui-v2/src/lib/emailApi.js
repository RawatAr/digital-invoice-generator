export async function apiSendInvoiceEmail(token, invoiceId, currency) {
  const qs = currency ? `?currency=${encodeURIComponent(currency)}` : '';
  const res = await fetch(`/api/email/${invoiceId}/send${qs}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to send invoice email');
  }

  return res.text().catch(() => 'Email sent');
}
