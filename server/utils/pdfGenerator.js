const PDFDocument = require('pdfkit');

function formatMoney(amount, currency) {
  const n = Number(amount || 0);
  const code = String(currency || 'INR').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

function generateInvoicePDF(doc, invoice, client, items, user, options = {}) {
  const currency = String(options.currency || 'INR').toUpperCase();
  const rate = Number(options.rate || 1);
  const convert = (value) => Number(value || 0) * rate;

  // Header
  if (user.companyLogo) {
    doc.image(user.companyLogo, 50, 45, { width: 50 });
  }
  doc.fontSize(20).text(user.companyName || 'Your Company', 110, 57);

  doc.fontSize(20).text('INVOICE', 200, 50, { align: 'right' });
  doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, 200, 75, { align: 'right' });
  doc.fontSize(10).text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 200, 90, { align: 'right' });
  doc.fontSize(10).text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 200, 105, { align: 'right' });

  // Bill To
  doc.fontSize(12).text('Bill To:', 50, 150);
  doc.text(client.name, 50, 165);
  doc.text(client.address, 50, 180);
  doc.text(client.email, 50, 195);

  // Invoice Table
  const tableTop = 250;
  const itemCol = 50;
  const qtyCol = 280;
  const rateCol = 370;
  const amountCol = 460;

  doc.fontSize(10).text('Description', itemCol, tableTop, { bold: true });
  doc.text('Quantity', qtyCol, tableTop, { bold: true });
  doc.text('Rate', rateCol, tableTop, { bold: true });
  doc.text('Amount', amountCol, tableTop, { bold: true, align: 'right' });

  let y = tableTop + 25;
  items.forEach(item => {
    doc.text(item.description, itemCol, y);
    doc.text(item.quantity.toString(), qtyCol, y);
    doc.text(formatMoney(convert(item.price), currency), rateCol, y);
    doc.text(formatMoney(convert(item.quantity * item.price), currency), amountCol, y, { align: 'right' });
    y += 25;
  });

  // Total
  doc
    .fontSize(12)
    .text(`Total: ${formatMoney(convert(invoice.total), currency)}`, 200, y + 30, { align: 'right', bold: true });

  // Footer
  doc.fontSize(10).text('Thank you for your business.', 50, doc.page.height - 50, { align: 'center' });
}

module.exports = { generateInvoicePDF };
