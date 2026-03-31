const nodemailer = require('nodemailer');
const env = require('../config/env');

async function sendEmail({ to, subject, html }) {
  // Guard
  if (!env.EMAIL_PASS || env.EMAIL_PASS === 'placeholder') {
    console.log('📧 Email service skipped: EMAIL_PASS is missing or placeholder.');
    console.log(`Target: ${to}, Subject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT),
    secure: env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${env.EMAIL_FROM}" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

async function sendLeadNotification(lead) {
  try {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px;">New Lead Intelligence</h1>
          <p style="color: #64748b; margin: 5px 0 0; font-size: 14px;">Incoming project signal captured</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; width: 30%;">Name</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px;">${lead.email}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Company</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px;">${lead.company || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Country</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px;">${lead.country || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Service</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px;">${lead.service || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Budget</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #ff6b00; font-size: 15px; font-weight: bold;">${lead.budget || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; vertical-align: top;">Description</td>
            <td style="padding: 12px 15px; color: #0f172a; font-size: 14px; line-height: 1.6;">${lead.description}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 30px;">
          <p style="margin: 0; color: #64748b; font-size: 12px; font-style: italic;">Referral: ${lead.referral || 'Direct'}</p>
        </div>

        <div style="text-align: center; gap: 15px;">
          <a href="mailto:${lead.email}" style="display: inline-block; padding: 14px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 14px; margin: 5px;">Send Email</a>
          <a href="${env.FRONTEND_URL}/admin/leads" style="display: inline-block; padding: 14px 24px; background-color: #ffffff; color: #0f172a; text-decoration: none; border: 1px solid #0f172a; border-radius: 14px; font-weight: bold; font-size: 14px; margin: 5px;">View in Dashboard</a>
        </div>
      </div>
    `;

    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `New Lead: ${lead.name} from ${lead.company || 'Individual'} — ${lead.budget || 'Unspecified'}`,
      html,
    });
  } catch (error) {
    console.error('Email failed but lead saved (sendLeadNotification):', error.message);
  }
}

async function sendLeadConfirmation(lead) {
  try {
    const firstName = lead.name.split(' ')[0];
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #0f172a; border-radius: 24px; color: #f8fafc; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; padding: 12px; background-color: #1e293b; border-radius: 16px; margin-bottom: 20px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Hello ${firstName}!</h1>
          <p style="color: #94a3b8; margin: 10px 0 0; font-size: 16px;">We've received your signal at JONTRO.</p>
        </div>
        
        <div style="background-color: #1e293b; padding: 30px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #334155;">
          <h2 style="color: #ff6b00; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Project Confirmation</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Our engineering team is already reviewing your details. We're excited about the possibility of collaborating on your vision.</p>
          
          <div style="border-top: 1px solid #334155; padding-top: 20px;">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px;">Project Summary</p>
            <p style="margin: 0; font-size: 15px;"><span style="color: #94a3b8;">Service:</span> ${lead.service || 'Software Development'}</p>
            <p style="margin: 4px 0; font-size: 15px;"><span style="color: #94a3b8;">Budget:</span> ${lead.budget || 'Unspecified'}</p>
            <p style="margin: 0; font-size: 15px;"><span style="color: #94a3b8;">Company:</span> ${lead.company || 'Individual'}</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 40px;">
          <p style="color: #ffffff; font-size: 16px; font-weight: 500; margin-bottom: 25px;">Please pick a time that works best for you:</p>
          <a href="https://calendly.com/jontro/meeting" style="display: inline-block; padding: 18px 36px; background-color: #ff6b00; color: #ffffff; text-decoration: none; border-radius: 18px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(255, 107, 0, 0.4);">Schedule Meeting</a>
        </div>

        <div style="text-align: center; border-top: 1px solid #1e293b; pt-30px;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">Best regards,</p>
          <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 5px;">The JONTRO Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: lead.email,
      subject: `We received your request, ${firstName}! Let's schedule a meeting`,
      html,
    });
  } catch (error) {
    console.error('Email failed but lead saved (sendLeadConfirmation):', error.message);
  }
}

async function sendApplicationNotification(application, jobTitle) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">New Job Application</h2>
      <p style="font-size: 16px;"><strong>Position:</strong> ${jobTitle}</p>
      <p style="font-size: 16px;"><strong>Applicant:</strong> ${application.name}</p>
      <p style="font-size: 16px;"><strong>Email:</strong> ${application.email}</p>
      <p style="font-size: 16px;"><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
      <p style="font-size: 16px;"><strong>Resume:</strong> <a href="${application.resumeUrl}">Download Resume</a></p>
      <p style="font-size: 16px;"><strong>LinkedIn:</strong> ${application.linkedIn || 'N/A'}</p>
      <p style="font-size: 16px;"><strong>Portfolio:</strong> ${application.portfolioUrl || 'N/A'}</p>
      <p style="font-size: 16px;"><strong>Cover Letter:</strong></p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b00;">
        ${application.coverLetter || 'No cover letter provided.'}
      </div>
    </div>
  `;

  await sendEmail({
    to: env.ADMIN_EMAIL,
    subject: `New Application: ${application.name} for ${jobTitle}`,
    html,
  });
}

async function sendApplicationConfirmation(application) {
  const firstName = application.name.split(' ')[0];
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #ff6b00;">Hi ${firstName},</h2>
      <p style="font-size: 16px;">Thank you for applying to join the <strong>JONTRO</strong> team!</p>
      <p style="font-size: 16px;">We've received your application and resume. Our hiring team will review your profile and if there's a match, we'll reach out to schedule an interview.</p>
      <p style="font-size: 16px;">Good luck!<br>The JONTRO Careers Team</p>
    </div>
  `;

  await sendEmail({
    to: application.email,
    subject: `Application Received - JONTRO`,
    html,
  });
}

module.exports = {
  sendLeadNotification,
  sendLeadConfirmation,
  sendApplicationNotification,
  sendApplicationConfirmation,
};
