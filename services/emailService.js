const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured. Email notifications will be skipped.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  return transporter;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const sendStockReductionEmail = async (data) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('Skipping email: transporter not available');
    return { success: false, message: 'Email not configured' };
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Material Stock System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Material Stock Reduced - ${data.materialName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Material Stock Reduced</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 40%;">Material:</td><td style="padding: 8px;">${data.materialName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Material Code:</td><td style="padding: 8px;">${data.materialCode}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Previous Stock:</td><td style="padding: 8px;">${data.previousQuantity}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Quantity Used:</td><td style="padding: 8px;">${data.quantity}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Remaining Stock:</td><td style="padding: 8px; color: ${data.newQuantity <= data.minimumStock ? '#dc3545' : '#28a745'}; font-weight: bold;">${data.newQuantity}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Issued To:</td><td style="padding: 8px;">${data.issuedTo || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Purpose:</td><td style="padding: 8px;">${data.purpose || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">${formatDate(data.date || new Date())}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">This is an automated notification from Material Stock Management System.</p>
      </div>
    `
  };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, message: error.message };
  }
};

const sendLowStockEmail = async (data) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('Skipping low stock email: transporter not available');
    return { success: false, message: 'Email not configured' };
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Material Stock System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Low Stock Alert - ${data.materialName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #ffc107; border-bottom: 2px solid #ffc107; padding-bottom: 10px;">⚠️ Low Stock Alert</h2>
        <p style="font-size: 16px;"><strong>${data.materialName}</strong> has reached the minimum stock level.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 40%;">Material Code:</td><td style="padding: 8px;">${data.materialCode}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Current Stock:</td><td style="padding: 8px; color: #dc3545; font-weight: bold;">${data.currentQuantity}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Minimum Stock Level:</td><td style="padding: 8px;">${data.minimumStock}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Unit:</td><td style="padding: 8px;">${data.unit || ''}</td></tr>
        </table>
        <p style="margin-top: 20px; background: #fff3cd; padding: 12px; border-radius: 4px; color: #856404;">
          Please restock this material as soon as possible.
        </p>
        <p style="margin-top: 15px; color: #666; font-size: 12px;">This is an automated notification from Material Stock Management System.</p>
      </div>
    `
  };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Low stock email error:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendStockReductionEmail,
  sendLowStockEmail
};
