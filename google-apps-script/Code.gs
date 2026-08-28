const SHEET_NAME = 'Inquiries';
const STATUS_OPTIONS = ['New', 'Contacted', 'Follow-up', 'Enrolled', 'Closed'];

function doPost(event) {
  try {
    const payload = JSON.parse((event.postData && event.postData.contents) || '{}');
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('SUBMISSION_SECRET');

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
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

      const row = sheet.getLastRow() + 1;
      sheet.getRange(row, 1, 1, 7).setValues([[
        new Date(),
        name,
        email,
        phone,
        message,
        'New',
        '',
      ]]);
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

function cleanValue(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
