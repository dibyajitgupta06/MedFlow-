import nodemailer from 'nodemailer';

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port === '465', // true for 465, false for other ports
      auth: { user, pass },
    });
    console.log('Nodemailer SMTP Transporter configured from environment.');
  } else {
    // Ethereal Email fallback
    try {
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
      console.log(`Nodemailer configured to Ethereal Email. Test Account User: ${testAccount.user}`);
    } catch (err) {
      console.warn('Failed to configure Ethereal email fallback. Console-only logging enabled.', err.message);
      // Mock transporter
      transporter = {
        sendMail: async (options) => {
          console.log('=== [MOCK EMAIL CONSOLE LOG] ===');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Content:\n${options.text || options.html}`);
          console.log('==================================');
          return { messageId: `mock-id-${Date.now()}` };
        }
      };
    }
  }
  return transporter;
};

/**
 * Send an email notification.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail({
      from: `"MedFlow Clinic" <noreply@medflow.com>`,
      to,
      subject,
      text,
      html,
    });
    
    console.log(`Email sent successfully to ${to} (ID: ${info.messageId})`);
    
    // Log Ethereal preview URL if applicable
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Ethereal Email] View message here: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return null;
  }
};

/**
 * Standard Email Templates
 */
export const getAppointmentEmailTemplate = (patientName, doctorName, date, time, status) => {
  const statusColor = status === 'approved' ? '#0d9488' : status === 'cancelled' ? '#ef4444' : '#f59e0b';
  return {
    subject: `MedFlow Appointment Update: ${status.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">MedFlow Healthcare</h1>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #0f172a;">Hello ${patientName},</h2>
          <p>This is an update regarding your scheduled appointment at MedFlow clinic.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p style="margin: 0 0 8px 0;"><strong>Time Slot:</strong> ${time}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
          </div>
          
          <p>If you have any questions or need to make changes, please log into your MedFlow dashboard.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    `,
  };
};

export const getPrescriptionEmailTemplate = (patientName, doctorName, diagnosis) => {
  return {
    subject: 'MedFlow: New Prescription Released',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">MedFlow Healthcare</h1>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #0f172a;">Hello ${patientName},</h2>
          <p>Your doctor, <strong>${doctorName}</strong>, has published a new prescription for you.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Diagnosis:</strong> ${diagnosis}</p>
            <p style="margin: 0;">You can now log into your patient portal to download the official prescription PDF for your pharmacies.</p>
          </div>
          
          <p>Please follow the prescribed dosage instructions carefully.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    `,
  };
};
