const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Item = require('../models/Item');
const { generateInvoicePDF: generateCustomInvoicePDF } = require('../utils/pdfGenerator');

const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client').populate('items');
    if (!invoice) {
      return res.status(404).send('Invoice not found');
    }

    // Authorization check
    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).send('User not authorized');
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    generateCustomInvoicePDF(doc, invoice, invoice.client, invoice.items, req.user);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = { generateInvoicePDF };
