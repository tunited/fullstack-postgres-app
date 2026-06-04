import nodemailer from 'nodemailer';
import pool from '../config/db.js';

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

const ENABLE_EMAILS = true; // Flag to quickly enable/disable email sending

const sendMail = async (options) => {
  if (!ENABLE_EMAILS) {
    console.log(`Email sending is disabled. Skipping email to: ${options.to} (Subject: "${options.subject}")`);
    return null;
  }
  try {
    console.log(`[SMTP] Attempting to send email to: "${options.to}" | CC: "${options.cc || ''}" | Subject: "${options.subject}"`);
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

// Fetch module description from database
async function getModuleDescription(moduleName) {
  if (!moduleName) return '-';
  try {
    const res = await pool.query('SELECT description FROM modules WHERE name = $1', [moduleName]);
    if (res.rows.length > 0 && res.rows[0].description) {
      return res.rows[0].description;
    }
  } catch (error) {
    console.error('Error fetching module description:', error);
  }
  return moduleName;
}

// Fetch customer contract_email from database
async function getCustomerContractEmail(custNum) {
  if (!custNum) return null;
  try {
    const res = await pool.query('SELECT contract_email FROM customers WHERE cust_num = $1', [custNum]);
    if (res.rows.length > 0 && res.rows[0].contract_email) {
      const email = res.rows[0].contract_email.trim();
      return email || null;
    }
  } catch (error) {
    console.error('Error fetching customer contract_email:', error);
  }
  return null;
}

const getFormattedTicketEmailHTML = (ticket, type, headline, typeLabel, messageUpdateHtml = '') => {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const ticketLink = `${CLIENT_URL}/?ticketId=${ticket.id}`;
  
  let priorityLabel = 'ปานกลาง (Medium)';
  let priorityStyle = 'background-color: #fef3c7; color: #d97706; border: 1px solid #fcd34d;';
  if (ticket.priority === 'high') {
    priorityLabel = 'สูง (High)';
    priorityStyle = 'background-color: #fee2e2; color: #ef4444; border: 1px solid #fca5a5;';
  } else if (ticket.priority === 'low') {
    priorityLabel = 'ต่ำ (Low)';
    priorityStyle = 'background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;';
  }

  let resolutionBlock = '';
  if (ticket.solution && ticket.solution.trim()) {
    resolutionBlock = `
      <h3 style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.02em;">
        ✅ แนวทางการแก้ไขปัญหา (Resolution / Solution)
      </h3>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 24px; text-align: left;">
        <tr>
          <td style="padding: 16px; font-size: 0.88rem; color: #15803d; line-height: 1.6;">
            ${ticket.solution.replace(/\n/g, '<br/>')}
          </td>
        </tr>
      </table>
    `;
  }

  let workaroundBlock = '';
  if (ticket.workaround && ticket.workaround.trim()) {
    workaroundBlock = `
      <h3 style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.02em;">
        💡 วิธีเลี่ยงปัญหาชั่วคราว (Workaround)
      </h3>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 1px solid #fef08a; border-radius: 8px; margin-bottom: 24px; text-align: left;">
        <tr>
          <td style="padding: 16px; font-size: 0.88rem; color: #a16207; line-height: 1.6;">
            ${ticket.workaround.replace(/\n/g, '<br/>')}
          </td>
        </tr>
      </table>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PPCC Care Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
          
          <!-- Gradient Header (Purple-Cyan Portal Theme) -->
          <tr>
            <td bgcolor="#7c3aed" style="background-color: #7c3aed; background-image: linear-gradient(135deg, #7c3aed, #0ea5e9); padding: 35px 30px; text-align: center;">
              <span style="display: inline-block; background-color: #935cef; color: #ffffff; padding: 5px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #a78bfa;">
                ${typeLabel}
              </span>
              <h1 style="color: #ffffff; margin: 0; font-size: 1.65rem; font-weight: 800; letter-spacing: -0.025em; line-height: 1.2;">
                PPCC Care Portal
              </h1>
              <p style="color: #e2e8f0; margin: 6px 0 0 0; font-size: 0.9rem; font-weight: 500;">
                ระบบบริหารจัดการและติดตามตั๋วบริการช่วยเหลือลูกค้า
              </p>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <!-- Greeting / Summary -->
              <h2 style="color: #0f172a; font-size: 1.2rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.35;">
                ${headline}
              </h2>
              <p style="color: #475569; font-size: 0.88rem; line-height: 1.5; margin: 0 0 20px 0;">
                ตั๋วบริการช่วยเหลือของคุณได้รับการประมวลผลและปรับเปลี่ยนความเคลื่อนไหวในระบบเรียบร้อยแล้ว โดยมีรายละเอียดดังต่อไปนี้ครับ:
              </p>

              <!-- Main Title Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-left: 4px solid #7c3aed; border-radius: 4px; margin-bottom: 24px; text-align: left;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 4px;">หัวเรื่องตั๋วช่วยเหลือ (Ticket Title)</div>
                    <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a; line-height: 1.4;">
                      ${ticket.title}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Metadata Grid -->
              <h3 style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin: 0 0 12px 0; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.02em;">
                📌 ข้อมูลเชิงรายละเอียด (Ticket Metadata)
              </h3>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; text-align: left;">
                <!-- Row 1: Ref Code & Priority -->
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 10px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">🔗 รหัสอ้างอิง (Ref. Code)</span>
                    <a href="${ticketLink}" style="font-size: 0.92rem; font-weight: 700; color: #0ea5e9; text-decoration: underline;">
                      ${ticket.ticket_number || ('#' + ticket.id)}
                    </a>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 12px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">🚨 ความเร่งด่วน (Priority)</span>
                    <span style="display: inline-block; font-size: 0.8rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; ${priorityStyle}">
                      ${priorityLabel}
                    </span>
                  </td>
                </tr>
                
                <!-- Row 2: Category & Module -->
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 10px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">📂 หมวดหมู่ (Category)</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">${ticket.category}</span>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 12px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">🧩 ระบบงาน (Module)</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">${ticket.moduleDescription || ticket.module || '-'}</span>
                  </td>
                </tr>

                <!-- Row 3: Program Type & Issue Type -->
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 10px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">💻 ประเภทโปรแกรม (Program Type)</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">${ticket.program_type || 'Standard'}</span>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 12px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">⚠️ ประเภทปัญหา (Issue Type)</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">${ticket.issue_type || 'Technical'}</span>
                  </td>
                </tr>

                <!-- Row 4: Form Name -->
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 10px;">
                    <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">🖥️ หน้าจอทำงาน (Form Name)</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">${ticket.form_name || '-'}</span>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 12px;">
                    &nbsp;
                  </td>
                </tr>
              </table>

              <!-- Description Block -->
              <h3 style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.02em;">
                📝 รายละเอียดแจ้งปัญหา (Issue Description)
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; text-align: left;">
                <tr>
                  <td style="padding: 16px; font-size: 0.88rem; color: #334155; line-height: 1.6;">
                    ${ticket.description ? ticket.description.replace(/\n/g, '<br/>') : '-'}
                  </td>
                </tr>
              </table>

              <!-- Chat Update Details -->
              ${messageUpdateHtml}

              <!-- Resolution & Workaround Blocks -->
              ${resolutionBlock}
              ${workaroundBlock}

              <!-- Call To Action (Glowing Portal Gradient Button) -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${ticketLink}" style="display: inline-block; background-color: #7c3aed; background-image: linear-gradient(135deg, #7c3aed, #0ea5e9); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; letter-spacing: -0.01em; box-shadow: 0 6px 20px rgba(124, 58, 237, 0.25); text-align: center;">
                      🔍 เปิดดูรายละเอียดตั๋วและตอบกลับบนระบบ (View Ticket Details)
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Elegant Footer -->
          <tr>
            <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 25px 30px; text-align: center;">
              <p style="margin: 0; font-size: 0.78rem; color: #64748b; line-height: 1.45;">
                นี่คือจดหมายแจ้งเตือนอัตโนมัติจากระบบงานสนับสนุนลูกค้า PPCC Care Portal<br/>
                กรุณาหลีกเลี่ยงการตอบกลับอีเมลฉบับนี้โดยตรง
              </p>
              <div style="margin-top: 12px; font-size: 0.8rem; font-weight: 700; color: #475569;">
                © 2026 PPCC Co., Ltd. All Rights Reserved.
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const sendTicketCreatedEmail = async (ticket, customerEmail, adminEmails, ccEmail = null) => {
  const subject = `[New Ticket] #${ticket.ticket_number || ticket.id} - ${ticket.title}`;
  const headline = `🎉 มีการเปิดตั๋วบริการช่วยเหลือรายการใหม่เข้ามาในระบบ`;
  const typeLabel = `ตั๋วช่วยเหลือใหม่ (New Ticket)`;
  
  const moduleDesc = await getModuleDescription(ticket.module);
  const ticketWithModuleDesc = { ...ticket, moduleDescription: moduleDesc };
  
  const html = getFormattedTicketEmailHTML(ticketWithModuleDesc, 'created', headline, typeLabel);
  const toEmails = [customerEmail, ...adminEmails].filter(Boolean).join(',');
 
  const mailOptions = {
    to: toEmails,
    subject,
    html
  };
 
  const contractEmail = await getCustomerContractEmail(ticket.cust_num);
  let finalCc = ccEmail;
  if (contractEmail) {
    finalCc = finalCc ? `${finalCc},${contractEmail}` : contractEmail;
  }
 
  if (finalCc) {
    mailOptions.cc = finalCc;
  }
 
  return sendMail(mailOptions);
};

export const sendTicketUpdatedEmail = async (ticket, toEmail, ccEmail = null, messageBody, senderName) => {
  const subject = `[Update] Ticket #${ticket.ticket_number || ticket.id} - ${ticket.title}`;
  const headline = `💬 มีการตอบกลับหรืออัปเดตข้อมูลตั๋วช่วยเหลือ`;
  const typeLabel = `อัปเดตสถานะตั๋ว (Ticket Updated)`;
  
  const messageUpdateHtml = `
    <h3 style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.02em;">
      💬 ข้อความตอบกลับล่าสุดจาก: ${senderName}
    </h3>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-left: 4px solid #0ea5e9; border-radius: 4px; margin-bottom: 24px; text-align: left;">
      <tr>
        <td style="padding: 14px 16px; font-size: 0.88rem; color: #334155; line-height: 1.5; font-style: italic;">
          "${messageBody.replace(/\n/g, '<br/>')}"
        </td>
      </tr>
    </table>
  `;

  const moduleDesc = await getModuleDescription(ticket.module);
  const ticketWithModuleDesc = { ...ticket, moduleDescription: moduleDesc };

  const html = getFormattedTicketEmailHTML(ticketWithModuleDesc, 'updated', headline, typeLabel, messageUpdateHtml);

  const mailOptions = {
    to: toEmail,
    subject,
    html
  };

  const contractEmail = await getCustomerContractEmail(ticket.cust_num);
  let finalCc = ccEmail;
  if (contractEmail) {
    finalCc = finalCc ? `${finalCc},${contractEmail}` : contractEmail;
  }

  if (finalCc) {
    mailOptions.cc = finalCc;
  }

  return sendMail(mailOptions);
};

export const sendTicketClosedEmail = async (ticket, toEmail, ccEmail = null) => {
  const subject = `[Resolved] Ticket #${ticket.ticket_number || ticket.id} - ${ticket.title}`;
  const headline = `✅ ตั๋วช่วยเหลือของคุณได้รับการแก้ไขเสร็จสิ้นแล้ว`;
  const typeLabel = `ปิดงานเสร็จสิ้น (Ticket Resolved)`;
  
  const moduleDesc = await getModuleDescription(ticket.module);
  const ticketWithModuleDesc = { ...ticket, moduleDescription: moduleDesc };
  
  const html = getFormattedTicketEmailHTML(ticketWithModuleDesc, 'closed', headline, typeLabel);

  const mailOptions = {
    to: toEmail,
    subject,
    html
  };

  const contractEmail = await getCustomerContractEmail(ticket.cust_num);
  let finalCc = ccEmail;
  if (contractEmail) {
    finalCc = finalCc ? `${finalCc},${contractEmail}` : contractEmail;
  }

  if (finalCc) {
    mailOptions.cc = finalCc;
  }

  return sendMail(mailOptions);
};
