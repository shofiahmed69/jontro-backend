/**
 * Generates responsive, high-converting HTML auto-reply for job applications.
 * Compatible with Gmail, Apple Mail, Outlook, and mobile clients.
 */
function getCareerConfirmationHtml({ name, jobTitle, applicationId }) {
  const firstName = (name || 'there').trim().split(' ')[0];
  const displayTitle = jobTitle || 'Business Development & Client Acquisition Executive';
  const shortId = applicationId ? applicationId.slice(-8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Application Received — JantraSoft</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; color: #f1f5f9;">
  <!-- Preheader text (preview snippet in inbox) -->
  <div style="display: none; font-size: 1px; color: #0b0f17; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    We have received your application for ${displayTitle} at JantraSoft. Here is what happens next.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f17;">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        <!-- Email Container -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111726; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #ea580c, #f97316, #fb923c); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td class="fluid-padding" style="padding: 36px 40px 24px 40px; text-align: center; border-bottom: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 8px 16px; background-color: rgba(234, 88, 12, 0.12); border: 1px solid rgba(234, 88, 12, 0.3); border-radius: 9999px; margin-bottom: 12px;">
                      <span style="color: #f97316; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Careers • Talent Acquisition</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                      JANTRA<span style="color: #ea580c;">SOFT</span>
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">
                      Engineering Next-Gen Digital Products & Solutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="fluid-padding" style="padding: 36px 40px 20px 40px;">
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Hi ${firstName}, 👋
              </h2>

              <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                Thank you for applying to join the team at <strong>JantraSoft</strong>! We’ve successfully received your application for the <span style="color: #f97316; font-weight: 600;">${displayTitle}</span> role.
              </p>

              <p style="margin: 0 0 28px 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                Our talent & leadership team is already reviewing your background and qualifications. We appreciate the time and care you put into your submission.
              </p>

              <!-- Application Summary Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f17; border-radius: 14px; border: 1px solid #1e293b; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ea580c; font-weight: 700; margin-bottom: 12px;">
                      Application Summary
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 35%;">Position</td>
                        <td style="padding: 6px 0; color: #f1f5f9; font-size: 14px; font-weight: 600;">${displayTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Applicant</td>
                        <td style="padding: 6px 0; color: #f1f5f9; font-size: 14px;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Status</td>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; padding: 3px 10px; background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; font-size: 12px; font-weight: 600;">
                            ✓ Under Review
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Submitted On</td>
                        <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Reference ID</td>
                        <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; font-family: monospace;">#${shortId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next Timeline -->
              <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                What happens next?
              </h3>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                <!-- Step 1 -->
                <tr>
                  <td valign="top" style="width: 32px; padding-bottom: 18px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #ea580c; color: #ffffff; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">1</div>
                  </td>
                  <td valign="top" style="padding-bottom: 18px; padding-left: 10px;">
                    <div style="color: #f1f5f9; font-size: 14px; font-weight: 600; margin-bottom: 3px;">Profile Review (Current)</div>
                    <div style="color: #94a3b8; font-size: 13px; line-height: 1.5;">Our team evaluates your skills, resume, and alignment with the position requirements.</div>
                  </td>
                </tr>

                <!-- Step 2 -->
                <tr>
                  <td valign="top" style="width: 32px; padding-bottom: 18px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #1e293b; color: #94a3b8; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; border: 1px solid #334155;">2</div>
                  </td>
                  <td valign="top" style="padding-bottom: 18px; padding-left: 10px;">
                    <div style="color: #f1f5f9; font-size: 14px; font-weight: 600; margin-bottom: 3px;">Shortlisting & Intro Call</div>
                    <div style="color: #94a3b8; font-size: 13px; line-height: 1.5;">If selected, we will reach out within 3–5 business days to schedule an initial discussion.</div>
                  </td>
                </tr>

                <!-- Step 3 -->
                <tr>
                  <td valign="top" style="width: 32px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #1e293b; color: #94a3b8; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; border: 1px solid #334155;">3</div>
                  </td>
                  <td valign="top" style="padding-left: 10px;">
                    <div style="color: #f1f5f9; font-size: 14px; font-weight: 600; margin-bottom: 3px;">Interview & Offer</div>
                    <div style="color: #94a3b8; font-size: 13px; line-height: 1.5;">An in-depth assessment and discussion regarding compensation, growth, and team expectations.</div>
                  </td>
                </tr>
              </table>

              <!-- Reply Prompt Callout -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(234, 88, 12, 0.08); border-radius: 12px; border: 1px solid rgba(234, 88, 12, 0.25); margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="color: #ea580c; font-size: 18px; width: 28px;" valign="top">💬</td>
                        <td style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">
                          <strong>Need to add anything?</strong> If you want to update your resume, portfolio link, or ask any questions, you can <strong style="color: #f97316;">reply directly to this email</strong> and our talent team will receive it immediately.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-top: 10px; padding-bottom: 10px;">
                    <a href="https://jantrasoft.online/careers" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: 0.2px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4);">
                      Explore JantraSoft Careers &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="fluid-padding" style="padding: 28px 40px; background-color: #0b0f17; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px;">
                © 2026 JantraSoft. All rights reserved. • Dhaka, Bangladesh
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="https://jantrasoft.online" target="_blank" style="color: #94a3b8; text-decoration: underline; margin: 0 8px;">Website</a>
                <span style="color: #334155;">•</span>
                <a href="https://jantrasoft.online/careers" target="_blank" style="color: #94a3b8; text-decoration: underline; margin: 0 8px;">Careers</a>
                <span style="color: #334155;">•</span>
                <a href="mailto:careers@jantrasoft.online" style="color: #94a3b8; text-decoration: underline; margin: 0 8px;">Contact Us</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
  getCareerConfirmationHtml,
};
