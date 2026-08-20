/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT — LEAD CAPTURE TO GOOGLE SHEETS + INSTANT GMAIL NOTIFICATIONS
 * ==============================================================================
 * 
 * 📧 INSTANT GMAIL NOTIFICATION (OPTION 3 — ZERO SETUP REQUIRED):
 * - Whenever a visitor submits a project inquiry on your portfolio, Google Apps
 *   Script instantly records the lead into your Google Sheet AND sends an
 *   instant, beautifully formatted push notification to your Gmail account.
 * - You can click "Reply" directly in your email to respond to the client immediately!
 * 
 * ------------------------------------------------------------------------------
 * HOW TO UPDATE IN APPS SCRIPT:
 * 1. Open your Google Sheet and click: Extensions > Apps Script
 * 2. Replace all existing code with this entire file.
 * 3. Click the "Save" icon (Floppy disk).
 * 4. Click "Deploy" (top right blue button) > "Manage deployments".
 * 5. Click the "Pencil (Edit)" icon > Set Version to "New version" > Click "Deploy".
 * ==============================================================================
 */

// OPTIONAL: Specify a custom recipient email (leave empty to send to your active Google account)
var CUSTOM_RECIPIENT_EMAIL = ""; 

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = new Date();
    var name = data.name || '';
    var email = data.email || '';
    
    // Force Google Sheets to treat phone number as plain text to preserve leading '+' country code
    var rawPhone = data.phone ? String(data.phone).trim() : '';
    var phone = rawPhone ? "'" + rawPhone : '';

    var service = data.service || '';
    var budget = data.budget || '';
    var message = data.message || '';

    // 1. Append lead to Google Sheets
    sheet.appendRow([timestamp, name, email, phone, service, budget, message]);

    // 2. Send instant Email Notification to your Gmail with 1-click Reply
    sendEmailNotification(name, email, rawPhone, service, budget, message);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', message: 'Lead saved successfully!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'active', message: 'Portfolio Lead API is operational!' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sends a rich, formatted email alert to your Gmail account with 1-click Reply
 */
function sendEmailNotification(name, email, phone, service, budget, message) {
  try {
    var recipient = CUSTOM_RECIPIENT_EMAIL.trim() || Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    if (!recipient) return;

    var subject = "🚀 New Portfolio Lead: " + name + " — " + service;

    var htmlBody = 
      '<div style="font-family: -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 28px; border-radius: 14px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12);">' +
        '<div style="border-bottom: 2px solid #ff6b35; padding-bottom: 14px; margin-bottom: 22px;">' +
          '<h2 style="color: #ffffff; margin: 0 0 4px; font-size: 22px; font-weight: 700;">🚀 New Project Inquiry Received</h2>' +
          '<span style="color: #a1a1aa; font-size: 13px;">Recorded in your Google Sheet automatically</span>' +
        '</div>' +
        
        '<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">' +
          '<tr><td style="padding: 9px 0; color: #a1a1aa; width: 130px; font-size: 14px;"><strong>Client Name:</strong></td><td style="padding: 9px 0; color: #ffffff; font-size: 15px; font-weight: 600;">' + name + '</td></tr>' +
          '<tr><td style="padding: 9px 0; color: #a1a1aa; font-size: 14px;"><strong>Email Address:</strong></td><td style="padding: 9px 0;"><a href="mailto:' + email + '" style="color: #38bdf8; text-decoration: none; font-size: 15px;">' + email + '</a></td></tr>' +
          '<tr><td style="padding: 9px 0; color: #a1a1aa; font-size: 14px;"><strong>Phone / WhatsApp:</strong></td><td style="padding: 9px 0; color: #ffffff; font-size: 15px;">' + (phone || 'Not provided') + '</td></tr>' +
          '<tr><td style="padding: 9px 0; color: #a1a1aa; font-size: 14px;"><strong>Service Needed:</strong></td><td style="padding: 9px 0; color: #ff6b35; font-size: 15px; font-weight: 700;">' + service + '</td></tr>' +
          '<tr><td style="padding: 9px 0; color: #a1a1aa; font-size: 14px;"><strong>Estimated Budget:</strong></td><td style="padding: 9px 0; color: #10b981; font-size: 15px; font-weight: 700;">' + budget + '</td></tr>' +
        '</table>' +
        
        '<div style="background: rgba(255,255,255,0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #ff6b35; margin-bottom: 24px;">' +
          '<strong style="color: #ffffff; display: block; margin-bottom: 8px; font-size: 14px;">Project Details / Message:</strong>' +
          '<p style="color: #e4e4e7; margin: 0; line-height: 1.65; font-size: 14px; white-space: pre-wrap;">' + message + '</p>' +
        '</div>' +
        
        '<div style="text-align: center; margin-top: 25px;">' +
          '<a href="mailto:' + email + '?subject=' + encodeURIComponent('Re: Project Inquiry — ' + service) + '" style="background: linear-gradient(135deg, #ff6b35 0%, #e8590c 100%); color: #ffffff; padding: 13px 28px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);">Reply to ' + name + '</a>' +
        '</div>' +
      '</div>';

    var plainText = 
      "New Project Inquiry Received!\n\n" +
      "Client Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + (phone || "Not provided") + "\n" +
      "Service: " + service + "\n" +
      "Budget: " + budget + "\n\n" +
      "Project Details:\n" + message + "\n\n" +
      "Recorded in your Google Sheet automatically.";

    MailApp.sendEmail({
      to: recipient,
      replyTo: email,
      subject: subject,
      body: plainText,
      htmlBody: htmlBody
    });
  } catch (err) {
    Logger.log("Email notification error: " + err.toString());
  }
}
