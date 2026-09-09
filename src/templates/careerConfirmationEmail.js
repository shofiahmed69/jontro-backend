/**
 * Executive HTML Confirmation Email for Job Applicants.
 * Dual-optimized for Desktop PC (Outlook, Gmail Web, Apple Mail)
 * and Mobile devices (iOS Mail, Gmail App, Android).
 * Strictly zero emojis, WCAG AA contrast compliant.
 */
function getCareerConfirmationHtml({ name, jobTitle, applicationId }) {
  const applicantName = (name && name.trim()) ? name.trim() : 'Applicant';
  const displayTitle = (jobTitle && jobTitle.trim()) ? jobTitle.trim() : 'Business Development & Client Acquisition Executive';
  const referenceId = applicationId ? applicationId.slice(-8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Application Acknowledgment - ${displayTitle}</title>
  <style type="text/css">
    /* Universal Reset */
    body, p, h1, h2, h3, table, td, div, a, span {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    body {
      background-color: #080c14;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #e2e8f0;
      width: 100% !important;
      height: 100% !important;
    }
    table {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      mso-line-height-rule: exactly;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      color: #ea580c;
      text-decoration: none;
    }

    /* Mobile Screen Optimizations */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
        padding: 16px 8px !important;
      }
      .email-card {
        width: 100% !important;
        border-radius: 12px !important;
      }
      .header-cell {
        padding: 24px 20px 20px 20px !important;
      }
      .body-cell {
        padding: 24px 20px 24px 20px !important;
      }
      .footer-cell {
        padding: 20px 16px !important;
      }
      .headline {
        font-size: 20px !important;
        line-height: 1.35 !important;
      }
      .app-record-table td {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }
      .step-cell {
        padding-bottom: 18px !important;
      }
      .footer-links a {
        display: inline-block !important;
        margin: 4px 6px !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, h1, h2, h3, p, a, span {
      font-family: Arial, sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #080c14; color: #e2e8f0;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #080c14; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Thank you for submitting your application for the ${displayTitle} role at JantraSoft.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080c14;">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 40px 16px;">
        
        <!--[if (gte mso 9)|(IE)]>
        <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
        <![endif]-->

        <!-- Main Card Container -->
        <table role="presentation" class="email-card" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111726; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 4px; background-color: #ea580c; line-height: 4px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td class="header-cell" style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle" align="left">
                    <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      JANTRA<span style="color: #ea580c;">SOFT</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-top: 4px;">
                      Talent Acquisition &amp; Recruitment
                    </div>
                  </td>
                  <td valign="middle" align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #1e293b; border: 1px solid #334155; border-radius: 6px; font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 0.04em;">
                      OFFICIAL
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Section -->
          <tr>
            <td class="body-cell" style="padding: 32px 36px 32px 36px;">
              
              <!-- Title -->
              <h1 class="headline" style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; margin-bottom: 20px;">
                Application Acknowledgment
              </h1>

              <!-- Greeting & Introductory Paragraph -->
              <p style="font-size: 15px; color: #f8fafc; line-height: 1.6; margin-bottom: 16px;">
                Dear ${applicantName},
              </p>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">
                Thank you for applying for the <strong style="color: #ffffff;">${displayTitle}</strong> role at <strong style="color: #ffffff;">JantraSoft</strong>. We confirm that your application and submitted materials have been received by our recruitment team.
              </p>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin-bottom: 28px;">
                Every submission is evaluated with careful consideration against the technical and commercial expectations of the position.
              </p>

              <!-- Application Record Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0e1a; border-radius: 10px; border: 1px solid #1e293b; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ea580c; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                      Application Details
                    </div>
                    
                    <table role="presentation" class="app-record-table" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; width: 34%;">Position</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #f8fafc; font-weight: 600;">${displayTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Applicant</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #f8fafc;">${applicantName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Submission Date</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #cbd5e1;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Reference ID</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">#${referenceId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Status</td>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; padding: 2px 8px; background-color: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.28); border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">
                            Under Review
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Process Roadmap -->
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ffffff; margin-bottom: 16px;">
                Selection Roadmap
              </div>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <!-- Step 1 -->
                <tr>
                  <td class="step-cell" valign="top" style="width: 32px; padding-bottom: 18px;">
                    <div style="width: 22px; height: 22px; border-radius: 4px; background-color: #ea580c; color: #ffffff; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; font-family: ui-monospace, monospace;">
                      01
                    </div>
                  </td>
                  <td class="step-cell" valign="top" style="padding-bottom: 18px; padding-left: 8px;">
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 3px;">
                      Document &amp; Profile Screening
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                      Initial review of submitted resume, portfolio assets, and professional background.
                    </div>
                  </td>
                </tr>

                <!-- Step 2 -->
                <tr>
                  <td class="step-cell" valign="top" style="width: 32px; padding-bottom: 18px;">
                    <div style="width: 22px; height: 22px; border-radius: 4px; background-color: #1e293b; color: #94a3b8; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; font-family: ui-monospace, monospace; border: 1px solid #334155;">
                      02
                    </div>
                  </td>
                  <td class="step-cell" valign="top" style="padding-bottom: 18px; padding-left: 8px;">
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 3px;">
                      Shortlisting &amp; Preliminary Discussion
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                      Qualified candidates will be contacted within 3 to 5 business days to coordinate a preliminary discussion.
                    </div>
                  </td>
                </tr>

                <!-- Step 3 -->
                <tr>
                  <td valign="top" style="width: 32px;">
                    <div style="width: 22px; height: 22px; border-radius: 4px; background-color: #1e293b; color: #94a3b8; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; font-family: ui-monospace, monospace; border: 1px solid #334155;">
                      03
                    </div>
                  </td>
                  <td valign="top" style="padding-left: 8px;">
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 3px;">
                      Technical &amp; Department Assessment
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                      Detailed discussion with hiring leadership on functional competencies and role expectations.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Inquiries & Reply Callout -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0e1a; border-left: 3px solid #ea580c; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ea580c; margin-bottom: 4px;">
                      Communications &amp; Supplementary Materials
                    </div>
                    <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      If you wish to provide updated materials, submit a portfolio link, or communicate with the hiring committee, you may reply directly to this email.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Sign-off Block -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 10px;">
                <tr>
                  <td>
                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 4px;">
                      Sincerely,
                    </p>
                    <p style="font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">
                      Talent Acquisition Committee
                    </p>
                    <p style="font-size: 13px; color: #94a3b8;">
                      JantraSoft &bull; Software &amp; Digital Solutions
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td class="footer-cell" style="padding: 24px 36px; background-color: #0a0e1a; border-top: 1px solid #1e293b; text-align: center;">
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 8px;">
                &copy; 2026 JantraSoft. All rights reserved. &bull; Dhaka, Bangladesh
              </p>
              <p style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 12px;">
                This communication contains official operational information regarding your employment application.
              </p>
              <div class="footer-links" style="font-size: 12px;">
                <a href="https://jantrasoft.online" target="_blank" style="color: #94a3b8; text-decoration: underline; margin: 0 8px;">Corporate Website</a>
                <span style="color: #334155;">&bull;</span>
                <a href="https://jantrasoft.online/careers" target="_blank" style="color: #94a3b8; text-decoration: underline; margin: 0 8px;">Careers Portal</a>
                <span style="color: #334155;">&bull;</span>
                <a href="mailto:careers@jantrasoft.online" style="color: #94a3b8; text-decoration: underline; margin: 0 8px;">Contact Support</a>
              </div>
            </td>
          </tr>

        </table>

        <!--[if (gte mso 9)|(IE)]>
            </td>
          </tr>
        </table>
        <![endif]-->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
  getCareerConfirmationHtml,
};
