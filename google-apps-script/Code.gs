const SHEET_NAME = 'Inquiries';
const WEBSITE_REQUEST_SHEET_NAME = 'Website Changes';
const STATUS_OPTIONS = ['New', 'Contacted', 'Follow-up', 'Enrolled', 'Closed'];

function authorizeWebsiteRequestEmail() {
  return MailApp.getRemainingDailyQuota();
}

function doPost(event) {
  try {
    const payload = JSON.parse((event.postData && event.postData.contents) || '{}');
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('SUBMISSION_SECRET');

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }

    if (payload.kind === 'website_change_request') {
      return handleWebsiteChangeRequest(payload);
    }

    const name = cleanValue(payload.name, 100);
    const email = cleanValue(payload.email, 254);
    const phone = cleanValue(payload.phone, 40);
    const message = cleanValue(payload.message, 2000);

    if (!name || !email || !message) {
      return jsonResponse({ ok: false, error: 'Missing required fields' });
    }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      return jsonResponse({ ok: false, error: 'Please try again' });
    }

    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error('Inquiry sheet not found');

      // appendRow intentionally creates a separate inquiry for every message,
      // even when a visitor submits the same name or email more than once.
      sheet.appendRow([
        new Date(),
        name,
        email,
        phone,
        message,
        'New',
        '',
      ]);
      const row = sheet.getLastRow();
      sheet.getRange(row, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
      sheet.getRange(row, 5).setWrap(true);
      sheet.getRange(row, 6).setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList(STATUS_OPTIONS, true)
          .setAllowInvalid(false)
          .build()
      );
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Inquiry submission failed.');
    return jsonResponse({ ok: false, error: 'Unable to save inquiry' });
  }
}

function handleWebsiteChangeRequest(payload) {
  const requestId = cleanValue(payload.requestId, 80);
  const editorEmail = cleanValue(payload.editorEmail, 254);
  const category = cleanValue(payload.category, 100);
  const page = cleanValue(payload.page, 100);
  const summary = cleanValue(payload.summary, 120);
  const details = cleanValue(payload.details, 3000);
  const referenceUrl = cleanValue(payload.referenceUrl, 500);
  const priority = cleanValue(payload.priority, 30) || 'normal';

  if (!editorEmail || !summary || !details) {
    return jsonResponse({ ok: false, error: 'Missing request details' });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse({ ok: false, error: 'Please try again' });
  }

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(WEBSITE_REQUEST_SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(WEBSITE_REQUEST_SHEET_NAME);
      sheet.appendRow(['Submitted', 'Request ID', 'Editor', 'Category', 'Page', 'Title', 'Details', 'Example Link', 'Priority', 'Status']);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#142d4c').setFontColor('#ffffff');
    }

    sheet.appendRow([
      new Date(), requestId, editorEmail, category, page, summary,
      details, referenceUrl, priority, 'New'
    ]);
    const row = sheet.getLastRow();
    sheet.getRange(row, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(row, 7).setWrap(true);
    sheet.autoResizeColumns(1, 10);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  const notificationEmail = PropertiesService.getScriptProperties().getProperty('WEBSITE_REQUEST_EMAIL');
  if (notificationEmail) {
    const subject = '[TCA Website] ' + summary;
    const message = [
      'A new website change request was submitted.',
      '',
      'From: ' + editorEmail,
      'Type: ' + category,
      'Page: ' + page,
      'Timing: ' + priority,
      '',
      summary,
      details,
      referenceUrl ? '\nExample: ' + referenceUrl : '',
      '',
      'Open the TCA Website Inquiries spreadsheet to review it.'
    ].join('\n');
    MailApp.sendEmail(notificationEmail, subject, message);
  }

  return jsonResponse({ ok: true });
}

function cleanValue(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
