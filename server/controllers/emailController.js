const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const EmailLog = require('../models/EmailLog');
const { generateInvoicePDF: generateCustomInvoicePDF } = require('../utils/pdfGenerator');
const { getLatestRatesInr, getRateFromInr, normalizeCurrencyCode } = require('../utils/fx');

function normalizeEmailList(value) {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : String(value).split(',');
  const cleaned = arr
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .filter((x, idx, a) => a.indexOf(x) === idx);
  return cleaned;
}

function isValidEmail(email) {
  const s = String(email || '').trim();
  if (!s) return false;
  // Practical (not RFC-perfect) validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function requireEmailConfig() {
  const missing = [];
  for (const key of ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM']) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length) {
    const err = new Error(`Email not configured. Missing env: ${missing.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
}

function makeTransporter() {
  const port = Number(process.env.EMAIL_PORT);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    requireTLS: !secure,
    tls: {
      servername: process.env.EMAIL_HOST,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  });
}

async function getInvoiceForEmail(req) {
  const invoice = await Invoice.findById(req.params.id).populate('client').populate('items').populate('user');
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(invoice.user?._id) !== String(req.user?.id)) {
    const err = new Error('User not authorized');
    err.statusCode = 401;
    throw err;
  }

  return invoice;
}

async function resolveCurrencyAndRate(req) {
  const currency = normalizeCurrencyCode(req.query.currency || 'INR');
  let rate = 1;
  if (currency !== 'INR') {
    const cached = await getLatestRatesInr();
    rate = getRateFromInr(cached.rates, currency);
  }
  return { currency, rate };
}

async function generateInvoicePdfBuffer(invoice, opts) {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  return await new Promise((resolve, reject) => {
    doc.on('data', buffers.push.bind(buffers));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    try {
      generateCustomInvoicePDF(doc, invoice, invoice.client, invoice.items, invoice.user, opts);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

function defaultEmailDraft(invoice) {
  const fromName = invoice?.user?.companyName || invoice?.user?.name || 'Invoice Studio';
  const invNo = invoice?.invoiceNumber || invoice?._id;

  const to = invoice?.client?.email ? [String(invoice.client.email)] : [];
  const subject = `Invoice #${invNo} from ${fromName}`;

  const lines = [
    `Hi ${invoice?.client?.name || ''},`.trim(),
    '',
    `Please find your invoice ${invNo ? `(#${invNo})` : ''} attached.`,
    '',
    'Thanks,',
    fromName,
  ].filter((x) => x !== undefined);

  return {
    from: process.env.EMAIL_FROM || '',
    to,
    cc: [],
    bcc: [],
    subject,
    bodyText: lines.join('\n'),
  };
}

async function sendAndLog({ req, invoice, currency, mail }) {
  requireEmailConfig();

  const logBase = {
    user: invoice.user._id,
    invoice: invoice._id,
    from: mail.from || process.env.EMAIL_FROM,
    to: normalizeEmailList(mail.to),
    cc: normalizeEmailList(mail.cc),
    bcc: normalizeEmailList(mail.bcc),
    subject: String(mail.subject || ''),
    bodyText: String(mail.text || ''),
    currency,
  };

  const invalid = [...logBase.to, ...logBase.cc, ...logBase.bcc].filter((e) => e && !isValidEmail(e));
  if (!logBase.to.length || invalid.length) {
    const err = new Error(
      !logBase.to.length ? 'At least one recipient is required.' : `Invalid email(s): ${invalid.join(', ')}`,
    );
    err.statusCode = 400;
    throw err;
  }

  const pdfData = await generateInvoicePdfBuffer(invoice, mail.pdfOpts);

  const transporter = makeTransporter();
  try {
    try {
      await transporter.verify();
    } catch (verifyErr) {
      const e = new Error(`SMTP verify failed: ${String(verifyErr?.message || verifyErr)}`);
      e.statusCode = 502;
      throw e;
    }

    const info = await transporter.sendMail({
      from: logBase.from,
      to: logBase.to.join(', '),
      cc: logBase.cc.length ? logBase.cc.join(', ') : undefined,
      bcc: logBase.bcc.length ? logBase.bcc.join(', ') : undefined,
      subject: logBase.subject,
      text: logBase.bodyText,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber || invoice._id}.pdf`,
          content: pdfData,
          contentType: 'application/pdf',
        },
      ],
    });

    const accepted = Array.isArray(info?.accepted) ? info.accepted.map((x) => String(x)) : [];
    const rejected = Array.isArray(info?.rejected) ? info.rejected.map((x) => String(x)) : [];
    const providerResponse = String(info?.response || '');

    await EmailLog.create({
      ...logBase,
      status: 'sent',
      providerMessageId: String(info?.messageId || ''),
      accepted,
      rejected,
      providerResponse,
      sentAt: new Date(),
    });

    return {
      ok: true,
      messageId: info?.messageId || '',
      accepted,
      rejected,
      response: providerResponse,
    };
  } catch (err) {
    await EmailLog.create({
      ...logBase,
      status: 'failed',
      errorMessage: String(err?.message || 'Failed to send email'),
      sentAt: new Date(),
    });
    throw err;
  }
}

const getInvoiceEmailDraft = async (req, res) => {
  try {
    const invoice = await getInvoiceForEmail(req);
    const { currency } = await resolveCurrencyAndRate(req);
    const draft = defaultEmailDraft(invoice);
    res.json({ invoiceId: String(invoice._id), currency, draft });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Server error');
  }
};

const sendInvoiceEmailCustom = async (req, res) => {
  try {
    const invoice = await getInvoiceForEmail(req);
    const { currency, rate } = await resolveCurrencyAndRate(req);

    const to = normalizeEmailList(req.body?.to);
    const cc = normalizeEmailList(req.body?.cc);
    const bcc = normalizeEmailList(req.body?.bcc);
    const subject = String(req.body?.subject || '').trim();
    const bodyText = String(req.body?.bodyText || '').trim();

    if (!subject) {
      return res.status(400).send('Subject is required');
    }
    if (!bodyText) {
      return res.status(400).send('Email content is required');
    }

    const result = await sendAndLog({
      req,
      invoice,
      currency,
      mail: {
        from: process.env.EMAIL_FROM,
        to,
        cc,
        bcc,
        subject,
        text: bodyText,
        pdfOpts: { currency, rate },
      },
    });

    res.status(200).json({
      message: 'Email sent successfully',
      messageId: result.messageId || '',
      accepted: result.accepted || [],
      rejected: result.rejected || [],
      response: result.response || '',
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Server error');
  }
};

const listInvoiceEmailHistory = async (req, res) => {
  try {
    const invoice = await getInvoiceForEmail(req);
    const logs = await EmailLog.find({ user: req.user.id, invoice: invoice._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Server error');
  }
};

const listEmailHistory = async (req, res) => {
  try {
    const logs = await EmailLog.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(200).lean();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Server error');
  }
};

const sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await getInvoiceForEmail(req);
    const { currency, rate } = await resolveCurrencyAndRate(req);

    const draft = defaultEmailDraft(invoice);
    const result = await sendAndLog({
      req,
      invoice,
      currency,
      mail: {
        from: draft.from,
        to: draft.to,
        cc: draft.cc,
        bcc: draft.bcc,
        subject: draft.subject,
        text: draft.bodyText,
        pdfOpts: { currency, rate },
      },
    });

    res.status(200).json({
      message: result.ok ? 'Email sent successfully' : 'Email sent',
      messageId: result.messageId || '',
      accepted: result.accepted || [],
      rejected: result.rejected || [],
      response: result.response || '',
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Server error');
  }
};

module.exports = {
  sendInvoiceEmail,
  getInvoiceEmailDraft,
  sendInvoiceEmailCustom,
  listInvoiceEmailHistory,
  listEmailHistory,
};
