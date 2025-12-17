const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF: generateCustomInvoicePDF } = require('../utils/pdfGenerator');

const sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client').populate('items').populate('user');
    if (!invoice) {
      return res.status(404).send('Invoice not found');
    }

    // Authorization check
    if (invoice.user._id.toString() !== req.user.id) {
      return res.status(401).send('User not authorized');
    }

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      let pdfData = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: invoice.client.email,
        subject: `Invoice #${invoice.invoiceNumber} from ${invoice.user.companyName || invoice.user.name}`,
        text: 'Please find your invoice attached.',
        attachments: [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfData,
            contentType: 'application/pdf',
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send('Email sent successfully');
    });

    generateCustomInvoicePDF(doc, invoice, invoice.client, invoice.items, invoice.user);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = { sendInvoiceEmail };
