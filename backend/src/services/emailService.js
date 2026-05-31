import nodemailer from 'nodemailer';

let transporter;

// Initialize the mail transporter
async function initTransporter() {
  if (transporter) return transporter;

  // Use real SMTP if provided in environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Using real SMTP server for emails.');
  } else {
    // Generate a test Ethereal account if no SMTP provided
    console.log('No SMTP config found. Generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Using Ethereal test SMTP server.');
  }
  return transporter;
}

const ENABLE_EMAILS = false; // Flag to quickly enable/disable email sending

const sendMail = async (options) => {
  if (!ENABLE_EMAILS) {
    console.log(`Email sending is disabled. Skipping email to: ${options.to} (Subject: "${options.subject}")`);
    return null;
  }
  try {
    const tp = await initTransporter();
    const info = await tp.sendMail({
      from: process.env.SMTP_FROM || '"PPCC Support" <support@ppcc.co.th>',
      ...options
    });
    
    console.log(`Email sent: ${info.messageId}`);
    // Only available for Ethereal emails
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log(`Preview test email: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendTicketCreatedEmail = async (ticket, customerEmail, adminEmails, ccEmail = null) => {
  const subject = `[New Ticket] #${ticket.ticket_number} - ${ticket.title}`;
  const html = `
    <h2>New Ticket Created</h2>
    <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    <p><strong>Category:</strong> ${ticket.category}</p>
    <p><strong>Module:</strong> ${ticket.module}</p>
    <br/>
    <p><strong>Description:</strong></p>
    <p>${ticket.description.replace(/\n/g, '<br/>')}</p>
    <hr/>
    <p><small>This is an automated message from the PPCC Support System.</small></p>
  `;

  // Send to Customer and Admins/Agents
  const toEmails = [customerEmail, ...adminEmails].filter(Boolean).join(',');

  const mailOptions = {
    to: toEmails,
    subject,
    html
  };

  if (ccEmail) {
    mailOptions.cc = ccEmail;
  }

  return sendMail(mailOptions);
};

export const sendTicketUpdatedEmail = async (ticket, toEmail, ccEmail = null, messageBody, senderName) => {
  const subject = `[Update] Ticket #${ticket.ticket_number} - ${ticket.title}`;
  const html = `
    <h2>Ticket Updated</h2>
    <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <br/>
    <p><strong>New message from ${senderName}:</strong></p>
    <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0;">
      ${messageBody.replace(/\n/g, '<br/>')}
    </blockquote>
    <hr/>
    <p><small>This is an automated message from the PPCC Support System.</small></p>
  `;

  const mailOptions = {
    to: toEmail,
    subject,
    html
  };

  if (ccEmail) {
    mailOptions.cc = ccEmail;
  }

  return sendMail(mailOptions);
};

export const sendTicketClosedEmail = async (ticket, toEmail, ccEmail = null) => {
  const subject = `[Resolved] Ticket #${ticket.ticket_number} - ${ticket.title}`;
  const html = `
    <h2>Ticket Resolved</h2>
    <p>Your support ticket has been marked as resolved.</p>
    <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <br/>
    <p>If you still face issues, please open a new ticket or reply to this thread (if applicable).</p>
    <hr/>
    <p><small>This is an automated message from the PPCC Support System.</small></p>
  `;

  const mailOptions = {
    to: toEmail,
    subject,
    html
  };

  if (ccEmail) {
    mailOptions.cc = ccEmail;
  }

  return sendMail(mailOptions);
};
