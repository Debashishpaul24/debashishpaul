/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT — LEAD CAPTURE TO GOOGLE SHEETS + GOOGLE DRIVE + GMAIL ALERTS
 * ==============================================================================
 * 
 * 📁 AUTOMATIC FILE ATTACHMENT SAVING TO GOOGLE DRIVE:
 * - When a client attaches a file (PDF, DOCX, PNG, JPG, ZIP), this script:
 *   1. Automatically saves the file into a "Portfolio Inquiry Attachments" folder in your Google Drive.
 *   2. Generates a secure, clickable Google Drive preview link.
 *   3. Inserts the clickable Google Drive Link directly into your Google Sheet row.
 *   4. Includes a direct "View Attached File" button in your Gmail notification alert!
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

// Recipient email address for lead notifications
var CUSTOM_RECIPIENT_EMAIL = "pauldebashish115@gmail.com"; 

/**
 * ==============================================================================
 * 🔑 ONE-TIME AUTHORIZATION & TEST FUNCTION:
 * Run this once in the Apps Script editor to grant permissions and test delivery:
 * 1. Select "testNotification" from the function dropdown at top toolbar.
 * 2. Click "Run".
 * 3. If prompted, click "Review permissions" -> choose your account -> "Advanced" -> "Go to... (unsafe)" -> "Allow".
 * 4. Check your Gmail inbox (pauldebashish115@gmail.com) for the test alert!
 * 5. Then click "Deploy" > "Manage deployments" > Edit (pencil) > "New version" > "Deploy".
 * ==============================================================================
 */
function testNotification() {
  authorizeDrive();
  sendEmailNotification(
    "David Miller (Test)",
    "Miller Design Studio",
    "david.miller@example.com",
    "+1 (415) 890-1234",
    "UI/UX Design",
    "Professional: Business / portfolio website",
    "₹30,000–₹50,000",
    "Hello Debashish, looking to redesign our agency portfolio with modern 3D scroll motion and fast loading times. Attached is our initial wireframe outline.",
    "",
    ""
  );
  Logger.log("✅ Test notification sent to: " + CUSTOM_RECIPIENT_EMAIL);
}

function authorizeDrive() {
  var root = DriveApp.getRootFolder();
  var folderName = "Portfolio Inquiry Attachments";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  Logger.log("✅ Google Drive permission granted successfully! Folder ready: " + folder.getName());
}

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
    var name = (data.name || '').trim();
    var business = (data.business_name || '').trim();
    var email = (data.email || '').trim();
    
    // Force Google Sheets to treat phone number as plain text to preserve leading '+' country code
    var rawPhone = data.phone ? String(data.phone).trim() : '';
    var phone = rawPhone ? "'" + rawPhone : '';

    var service = (data.service || '').trim();
    var requirementTier = (data.requirement_tier || '').trim();
    var budget = (data.budget || '').trim();
    var message = (data.message || '').trim();

    // 1. Process File Attachment -> Save into Google Drive
    var attachmentUrl = '';
    var attachmentName = data.attachment_name || '';

    if (data.attachment_data && attachmentName) {
      try {
        var folderName = "Portfolio Inquiry Attachments";
        var folders = DriveApp.getFoldersByName(folderName);
        var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

        var base64Data = data.attachment_data;
        var contentType = "application/octet-stream";

        if (base64Data.indexOf("data:") !== -1 && base64Data.indexOf(";base64,") !== -1) {
          var parts = base64Data.split(";base64,");
          contentType = parts[0].replace("data:", "");
          base64Data = parts[1];
        }

        var decodedBytes = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(decodedBytes, contentType, attachmentName);
        var driveFile = folder.createFile(blob);
        
        // Allow owner & anyone with link to view
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        attachmentUrl = driveFile.getUrl();
      } catch (fileErr) {
        attachmentUrl = "Error saving file: " + fileErr.toString();
      }
    }

    // 2. Append lead row to Google Sheets
    // Columns: [Timestamp, Name, Business Name, Email, Phone, Service, Requirement Tier, Budget, Requirement Details, Attachment Link]
    sheet.appendRow([
      timestamp,
      name,
      business || 'Individual / Personal',
      email,
      phone,
      service,
      requirementTier || 'Not specified',
      budget,
      message,
      attachmentUrl ? attachmentUrl : 'No file attached'
    ]);

    // 3. Send instant Email Notification to your Gmail with 1-click Reply & Drive link
    sendEmailNotification(name, business, email, rawPhone, service, requirementTier, budget, message, attachmentUrl, attachmentName);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', message: 'Lead saved successfully with attachment!' }))
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
function sendEmailNotification(name, business, email, phone, service, requirementTier, budget, message, attachmentUrl, attachmentName) {
  try {
    var recipient = CUSTOM_RECIPIENT_EMAIL.trim() || Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    if (!recipient) return;

    var subject = "🚀 New Portfolio Consultation: " + name + (business ? " (" + business + ")" : "") + " — " + service;

    var attachmentSection = '';
    if (attachmentUrl) {
      attachmentSection = 
        '<div style="background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.3); padding: 14px; border-radius: 10px; margin-bottom: 22px;">' +
          '<strong style="color: #ff6b35; font-size: 14px; display: block; margin-bottom: 6px;">📎 Attached File / Wireframe:</strong>' +
          '<a href="' + attachmentUrl + '" target="_blank" style="color: #ffffff; background: #ff6b35; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">View in Google Drive (' + attachmentName + ') ↗</a>' +
        '</div>';
    }

    var htmlBody = 
      '<div style="font-family: -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 28px; border-radius: 14px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12);">' +
        '<div style="border-bottom: 2px solid #ff6b35; padding-bottom: 14px; margin-bottom: 22px;">' +
          '<h2 style="color: #ffffff; margin: 0 0 4px; font-size: 22px; font-weight: 700;">🚀 New Project Consultation Inquiry</h2>' +
          '<span style="color: #a1a1aa; font-size: 13px;">Recorded in Google Sheets & Drive automatically</span>' +
        '</div>' +
        
        '<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; width: 140px; font-size: 14px;"><strong>Client Name:</strong></td><td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: 600;">' + name + '</td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Business Name:</strong></td><td style="padding: 8px 0; color: #e4e4e7; font-size: 14px;">' + (business || 'Not provided') + '</td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Email Address:</strong></td><td style="padding: 8px 0;"><a href="mailto:' + email + '" style="color: #38bdf8; text-decoration: none; font-size: 15px;">' + email + '</a></td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Phone / WhatsApp:</strong></td><td style="padding: 8px 0; color: #ffffff; font-size: 15px;">' + (phone || 'Not provided') + '</td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Service Required:</strong></td><td style="padding: 8px 0; color: #ff6b35; font-size: 15px; font-weight: 700;">' + service + '</td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Requirement Tier:</strong></td><td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">' + (requirementTier || 'Not specified') + '</td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Estimated Budget:</strong></td><td style="padding: 8px 0; color: #10b981; font-size: 15px; font-weight: 700;">' + budget + '</td></tr>' +
          '<tr><td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Attached File:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + (attachmentUrl ? '<a href="' + attachmentUrl + '" target="_blank" style="color: #ff6b35; text-decoration: underline; font-weight: 600;">' + attachmentName + ' ↗</a>' : '<span style="color: #71717a;">None</span>') + '</td></tr>' +
        '</table>' +
        
        attachmentSection +

        '<div style="background: rgba(255,255,255,0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #ff6b35; margin-bottom: 24px;">' +
          '<strong style="color: #ffffff; display: block; margin-bottom: 8px; font-size: 14px;">Tell us about your requirement:</strong>' +
          '<p style="color: #e4e4e7; margin: 0; line-height: 1.65; font-size: 14px; white-space: pre-wrap;">' + message + '</p>' +
        '</div>' +
        
        '<div style="text-align: center; margin-top: 25px;">' +
          '<a href="mailto:' + email + '?subject=' + encodeURIComponent('Re: Project Inquiry — ' + service) + '" style="background: linear-gradient(135deg, #ff6b35 0%, #e8590c 100%); color: #ffffff; padding: 13px 28px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);">Reply to ' + name + '</a>' +
        '</div>' +
      '</div>';

    var plainText = 
      "New Project Consultation Received!\n\n" +
      "Client Name: " + name + "\n" +
      "Business Name: " + (business || "Not provided") + "\n" +
      "Email Address: " + email + "\n" +
      "Phone / WhatsApp: " + (phone || "Not provided") + "\n" +
      "Service Required: " + service + "\n" +
      "Requirement Tier: " + (requirementTier || "Not specified") + "\n" +
      "Estimated Budget: " + budget + "\n" +
      "Attached File: " + (attachmentUrl ? attachmentUrl + " (" + attachmentName + ")" : "None") + "\n\n" +
      "Tell us about your requirement:\n" + message + "\n\n" +
      "Recorded in your Google Sheet & Drive automatically.";

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
