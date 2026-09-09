const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const env = require('../config/env');
const { getCareerConfirmationHtml } = require('../templates/careerConfirmationEmail');

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function sendEmail({ to, subject, html, from, replyTo }) {
  // Try Resend first if API key is provided
  if (resend) {
    try {
      const sender = from || env.RESEND_FROM || 'JantraSoft Careers <careers@jantrasoft.online>';
      const recipients = Array.isArray(to) ? to : [to];
      const payload = {
        from: sender,
        to: recipients,
        subject,
        html,
      };
      if (replyTo) {
        payload.replyTo = replyTo;
      }
      const { data, error } = await resend.emails.send(payload);
      if (error) {
        console.error('[Resend API Error]:', error);
      } else {
        return data;
      }
    } catch (resendError) {
      console.error('[Resend Email Error]:', resendError);
      // Continue to fallback
    }
  }

  // Guard for Nodemailer fallback
  if (!env.EMAIL_PASS || env.EMAIL_PASS === 'placeholder') {
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
      from: from || `"${env.EMAIL_FROM}" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
    });
  } catch (error) {
    console.error('[Nodemailer Email Error]:', error);
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
          <p style="color: #94a3b8; margin: 10px 0 0; font-size: 16px;">We've received your project inquiry at JantraSoft.</p>
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
          <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 5px;">The JantraSoft Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: lead.email,
      subject: `We received your request, ${firstName}! Let's schedule a meeting`,
      html,
    });
  } catch (error) {
  }
}

async function sendApplicationNotification(application, jobTitle) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #0b0f17; color: #f1f5f9; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ea580c; font-weight: 700;">New Candidate Submission</span>
        <h2 style="color: #ffffff; margin: 6px 0 0 0; font-size: 20px;">${jobTitle || 'Open Position'}</h2>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 30%;">Applicant</td>
          <td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600;">${application.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td>
          <td style="padding: 8px 0; color: #f1f5f9; font-size: 14px;"><a href="mailto:${application.email}" style="color: #f97316;">${application.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Phone</td>
          <td style="padding: 8px 0; color: #f1f5f9; font-size: 14px;">${application.phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Resume</td>
          <td style="padding: 8px 0; font-size: 14px;"><a href="${application.resumeUrl}" target="_blank" style="color: #10b981; font-weight: 600; text-decoration: underline;">Download / View Resume &rarr;</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">LinkedIn</td>
          <td style="padding: 8px 0; font-size: 14px;">${application.linkedIn ? `<a href="${application.linkedIn}" target="_blank" style="color: #38bdf8;">${application.linkedIn}</a>` : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Portfolio</td>
          <td style="padding: 8px 0; font-size: 14px;">${application.portfolioUrl ? `<a href="${application.portfolioUrl}" target="_blank" style="color: #38bdf8;">${application.portfolioUrl}</a>` : 'N/A'}</td>
        </tr>
      </table>

      ${application.coverLetter ? `
        <div style="background-color: #111726; padding: 18px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
          <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px;">Cover Letter / Note:</div>
          <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${application.coverLetter}</div>
        </div>
      ` : ''}

      <div style="text-align: center; padding-top: 10px;">
        <a href="mailto:${application.email}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-right: 10px;">
          Reply to Candidate
        </a>
        <a href="${env.FRONTEND_URL}/admin/applications" style="display: inline-block; background-color: #1e293b; color: #f1f5f9; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; border: 1px solid #334155;">
          Open Admin Panel
        </a>
      </div>
    </div>
  `;

  await sendEmail({
    to: env.ADMIN_EMAIL,
    from: env.RESEND_FROM || 'JantraSoft Careers <careers@jantrasoft.online>',
    replyTo: application.email,
    subject: `New Application: ${application.name} — ${jobTitle}`,
    html,
  });
}

async function sendApplicationConfirmation(application, jobTitle) {
  try {
    const html = getCareerConfirmationHtml({
      name: application.name,
      jobTitle: jobTitle || 'Business Development & Client Acquisition Executive',
      applicationId: application.id,
    });

    const roleName = jobTitle || 'Career Opportunity';

    return await sendEmail({
      to: application.email,
      from: env.RESEND_FROM || 'JantraSoft Careers <careers@jantrasoft.online>',
      replyTo: 'careers@jantrasoft.online',
      subject: `Application Received: ${roleName} — JantraSoft`,
      html,
    });
  } catch (error) {
    console.error('[sendApplicationConfirmation Error]:', error);
  }
}

module.exports = {
  sendLeadNotification,
  sendLeadConfirmation,
  sendApplicationNotification,
  sendApplicationConfirmation,
};
