const PDFDocument = require('pdfkit');

function generateInvoicePDF(doc, invoice, client, items, user) {
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
    doc.text(`$${item.price.toFixed(2)}`, rateCol, y);
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, amountCol, y, { align: 'right' });
    y += 25;
  });

  // Total
  doc.fontSize(12).text(`Total: $${invoice.total.toFixed(2)}`, 200, y + 30, { align: 'right', bold: true });

  // Footer
  doc.fontSize(10).text('Thank you for your business.', 50, doc.page.height - 50, { align: 'center' });
}

module.exports = { generateInvoicePDF };
