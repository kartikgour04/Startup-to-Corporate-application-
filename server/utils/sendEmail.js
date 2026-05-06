const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // If email not configured, log clearly and throw so caller can handle
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your_gmail@gmail.com' ||
      process.env.EMAIL_PASS === 'your_16_char_app_password') {
    console.warn('⚠️  EMAIL NOT CONFIGURED — Add EMAIL_USER and EMAIL_PASS to server/.env');
    console.warn('   See INDIA_SETUP.md for Gmail App Password instructions');
    throw new Error('Email not configured. Add EMAIL_USER and EMAIL_PASS to server/.env');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }, // needed for some hosting environments
  });

  await transporter.verify(); // test connection before sending
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'Nexus Platform'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`✅ Email sent to ${to} — ${subject}`);
};

module.exports = sendEmail;
