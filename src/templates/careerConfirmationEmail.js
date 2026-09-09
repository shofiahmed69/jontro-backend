/**
 * Professional, mobile-optimized HTML confirmation email for job applicants.
 * Strictly zero emojis, executive typography, and multi-client responsive layout.
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
    /* Reset & Base Styles */
    body, p, h1, h2, h3, table, td, div, a {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    body {
      background-color: #0b0f17;
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
    a {
      color: #ea580c;
      text-decoration: none;
    }
    /* Mobile Styles */
    @media only screen and (max-width: 600px) {
      .mobile-wrapper {
        width: 100% !important;
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
      .mobile-card {
        width: 100% !important;
        border-radius: 12px !important;
      }
      .mobile-header-padding {
        padding: 24px 20px 20px 20px !important;
      }
      .mobile-content-padding {
        padding: 24px 20px 20px 20px !important;
      }
      .mobile-footer-padding {
        padding: 20px 16px !important;
      }
      .mobile-button {
        width: 100% !important;
        display: block !important;
        text-align: center !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .mobile-table-stack td {
        display: block !important;
        width: 100% !important;
        padding-bottom: 6px !important;
      }
      .mobile-table-stack td.col-label {
        padding-top: 8px !important;
        padding-bottom: 2px !important;
      }
      .headline {
        font-size: 20px !important;
        line-height: 1.3 !important;
      }
      .step-item {
        padding-bottom: 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; color: #e2e8f0;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #0b0f17; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Thank you for submitting your application for the ${displayTitle} role at JantraSoft.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f17; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        
        <!-- Main Email Container -->
        <table role="presentation" class="mobile-wrapper" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table role="presentation" class="mobile-card" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #111726; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
                
                <!-- Corporate Accent Bar -->
                <tr>
                  <td style="height: 3px; background-color: #ea580c; line-height: 3px; font-size: 0;">&nbsp;</td>
                </tr>

                <!-- Header / Brand -->
                <tr>
                  <td class="mobile-header-padding" style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #1e293b; text-align: left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                            JANTRA<span style="color: #ea580c;">SOFT</span>
                          </div>
                          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-top: 4px;">
                            Talent Acquisition &amp; Recruitment
                          </div>
                        </td>
                        <td align="right" valign="top">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #1e293b; border: 1px solid #334155; border-radius: 6px; font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 0.04em;">
                            CONFIDENTIAL
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Content Body -->
                <tr>
                  <td class="mobile-content-padding" style="padding: 32px 36px 28px 36px;">
                    
                    <!-- Subject Heading -->
                    <h1 class="headline" style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; margin-bottom: 20px;">
                      Application Acknowledgment
                    </h1>

                    <!-- Salutation & Formal Statement -->
                    <p style="font-size: 15px; color: #f1f5f9; line-height: 1.6; margin-bottom: 16px;">
                      Dear ${applicantName},
                    </p>

                    <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">
                      Thank you for submitting your application for the <strong style="color: #ffffff;">${displayTitle}</strong> position at <strong style="color: #ffffff;">JantraSoft</strong>. We confirm that your submission and accompanying documentation have been received by our recruitment committee.
                    </p>

                    <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin-bottom: 28px;">
                      Our team reviews each candidate file thoroughly against role requirements and our technical standards.
                    </p>

                    <!-- Application Record Summary Table -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f17; border-radius: 10px; border: 1px solid #1e293b; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 20px;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                            Application Record
                          </div>
                          
                          <table role="presentation" class="mobile-table-stack" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td class="col-label" style="padding: 6px 0; font-size: 13px; color: #94a3b8; width: 35%;">Designation</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #f8fafc; font-weight: 600;">${displayTitle}</td>
                            </tr>
                            <tr>
                              <td class="col-label" style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Applicant</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #f8fafc;">${applicantName}</td>
                            </tr>
                            <tr>
                              <td class="col-label" style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Submission Date</td>
                              <td style="padding: 6px 0; font-size: 14px; color: #cbd5e1;">${dateStr}</td>
                            </tr>
                            <tr>
                              <td class="col-label" style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Application ID</td>
                              <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">#${referenceId}</td>
                            </tr>
                            <tr>
                              <td class="col-label" style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Status</td>
                              <td style="padding: 6px 0;">
                                <span style="display: inline-block; padding: 2px 8px; background-color: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">
                                  Under Review
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Review Process Overview -->
                    <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #ffffff; margin-bottom: 16px;">
                      Next Steps
                    </div>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                      <!-- Stage 1 -->
                      <tr>
                        <td class="step-item" valign="top" style="width: 32px; padding-bottom: 16px;">
                          <div style="width: 22px; height: 22px; border-radius: 4px; background-color: #ea580c; color: #ffffff; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; font-family: monospace;">
                            01
                          </div>
                        </td>
                        <td class="step-item" valign="top" style="padding-bottom: 16px; padding-left: 8px;">
                          <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 2px;">
                            Document &amp; Profile Screening
                          </div>
                          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                            Our hiring team conducts an initial evaluation of qualifications, experience, and submission materials.
                          </div>
                        </td>
                      </tr>

                      <!-- Stage 2 -->
                      <tr>
                        <td class="step-item" valign="top" style="width: 32px; padding-bottom: 16px;">
                          <div style="width: 22px; height: 22px; border-radius: 4px; background-color: #1e293b; color: #94a3b8; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; font-family: monospace; border: 1px solid #334155;">
                            02
                          </div>
                        </td>
                        <td class="step-item" valign="top" style="padding-bottom: 16px; padding-left: 8px;">
                          <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 2px;">
                            Shortlisting &amp; Preliminary Discussion
                          </div>
                          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                            Candidates meeting role requirements will be contacted within 3 to 5 business days to coordinate a preliminary call.
                          </div>
                        </td>
                      </tr>

                      <!-- Stage 3 -->
                      <tr>
                        <td valign="top" style="width: 32px;">
                          <div style="width: 22px; height: 22px; border-radius: 4px; background-color: #1e293b; color: #94a3b8; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; font-family: monospace; border: 1px solid #334155;">
                            03
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 8px;">
                          <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-bottom: 2px;">
                            Technical &amp; Commercial Assessment
                          </div>
                          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                            Shortlisted applicants proceed to in-depth discussions with the relevant department lead.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Direct Reply Notice -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f17; border-left: 3px solid #ea580c; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 14px 18px;">
                          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #ea580c; margin-bottom: 4px;">
                            Communications &amp; Supplementary Materials
                          </div>
                          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                            To submit an updated resume, provide portfolio links, or inquire regarding your application status, you may reply directly to this email.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Corporate Sign-off -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 12px; border-top: 1px solid #1e293b; padding-top: 20px;">
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

                <!-- Footer -->
                <tr>
                  <td class="mobile-footer-padding" style="padding: 24px 36px; background-color: #090d15; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 8px;">
                      &copy; 2026 JantraSoft. All rights reserved. &bull; Dhaka, Bangladesh
                    </p>
                    <p style="font-size: 11px; color: #475569; line-height: 1.5;">
                      This is an automated operational notification regarding your employment inquiry. Please do not forward confidential hiring communications.
                    </p>
                    <p style="font-size: 12px; margin-top: 12px;">
                      <a href="https://jantrasoft.online" target="_blank" style="color: #94a3b8; text-decoration: underline; margin: 0 6px;">Corporate Site</a>
                      <span style="color: #334155;">&bull;</span>
                      <a href="https://jantrasoft.online/careers" target="_blank" style="color: #94a3b8; text-decoration: underline; margin: 0 6px;">Careers Portal</a>
                      <span style="color: #334155;">&bull;</span>
                      <a href="mailto:careers@jantrasoft.online" style="color: #94a3b8; text-decoration: underline; margin: 0 6px;">Contact Support</a>
                    </p>
                  </td>
                </tr>

              </table>
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
