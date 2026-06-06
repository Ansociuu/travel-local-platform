require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'nk.anbmtabc@gmail.com', // Sending to themselves for testing
  from: process.env.SENDGRID_FROM_EMAIL || 'nk.anbmtabc@gmail.com',
  subject: 'Test Email from Node.js',
  text: 'This is a test email.',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
  })
  .catch((error) => {
    console.error('Error sending email:');
    console.error(error.response ? error.response.body : error);
  });
