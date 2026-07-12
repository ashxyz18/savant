import nodemailer from 'nodemailer';
import SiteSettings from '../models/SiteSettings.js';

const getTransporter = async () => {
  const settings = await SiteSettings.getSingleton();
  const smtp = settings.smtp || {};

  return nodemailer.createTransport({
    host: smtp.host || 'smtp.gmail.com',
    port: smtp.port || 587,
    secure: (smtp.port || 587) === 465,
    auth: {
      user: smtp.user || process.env.SMTP_USER || '',
      pass: smtp.password || process.env.SMTP_PASSWORD || '',
    },
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const settings = await SiteSettings.getSingleton();
  const smtp = settings.smtp || {};
  const fromEmail = smtp.fromEmail || process.env.SMTP_USER || 'roseobd@mail.com';
  const fromName = smtp.fromName || 'ROSEO';

  const transporter = await getTransporter();

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Password Reset - ROSEO',
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <div style="background:#1a1a1a;padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">ROSEO</h1>
          <p style="color:#f97316;margin:5px 0 0;">Premium Leather Goods</p>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e5e5e5;border-radius:0 0 12px 12px;">
          <h2 style="color:#1a1a1a;margin:0 0 20px;">Reset Your Password</h2>
          <p style="color:#525252;font-size:15px;line-height:1.6;">
            We received a request to reset your password. Click the button below to choose a new one:
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:#1a1a1a;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color:#737373;font-size:13px;line-height:1.6;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:25px 0;" />
          <p style="color:#a3a3a3;font-size:12px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color:#f97316;word-break:break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `,
  });
};

export const sendContactNotification = async (chat) => {
  const settings = await SiteSettings.getSingleton();
  const smtp = settings.smtp || {};
  const fromEmail = smtp.fromEmail || process.env.SMTP_USER || 'roseobd@mail.com';
  const fromName = smtp.fromName || 'ROSEO';
  const toEmail = smtp.fromEmail || process.env.SMTP_USER || 'roseobd@mail.com';

  const transporter = await getTransporter();

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: `New Chat Message from ${chat.userName}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <div style="background:#1a1a1a;padding:20px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">New Customer Message</h1>
        </div>
        <div style="padding:20px;background:#fff;border:1px solid #e5e5e5;border-radius:0 0 12px 12px;">
          <p><strong>From:</strong> ${chat.userName} (${chat.userEmail})</p>
          <p><strong>Subject:</strong> ${chat.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:10px 0;">
            ${chat.messages[chat.messages.length - 1]?.text || ''}
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/chats" style="background:#1a1a1a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:10px;">
            Reply in Admin Panel
          </a>
        </div>
      </div>
    `,
  });
};
