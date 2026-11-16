// Isolated preview receiver. The caller must pass the existing submission secret.
function handleTrialPreview(payload) {
  if (payload.preview !== 'free-trial-review') return jsonResponse({ ok: false });
  const data = payload.trial || {};
  const testId = cleanValue(data.testId, 80);
  if (!testId || !data.parentName || !data.email || !data.childName || !data.class1 || !data.class2) {
    return jsonResponse({ ok: false, error: 'Missing test details' });
  }
  const cell = function (value, max) {
    const text = cleanValue(value, max || 1000);
    return /^[=+\-@]/.test(text) ? "'" + text : text;
  };
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse({ ok: false, error: 'Please retry' });
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Free Trial Test');
    if (!sheet) return jsonResponse({ ok: false, error: 'Test tab unavailable' });
    const lastRow = sheet.getLastRow();
    // A network retry with the same ID must not create a duplicate test row.
    if (lastRow > 1) {
      const found = sheet.getRange(2, 2, lastRow - 1, 1).createTextFinder(testId).matchEntireCell(true).findNext();
      if (found) return jsonResponse({ ok: true, row: found.getRow(), testId: testId });
    }
    if (lastRow >= 1000) return jsonResponse({ ok: false, error: 'Test tab full' });
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss'), testId,
      cell(data.parentName, 100), cell(data.email, 254), cell(data.phone, 40),
      cell(data.childName, 100), cell(data.dob, 10), cell(data.childAge, 30), cell(data.interests),
      cell(data.street, 160), cell(data.unit, 60), cell(data.city, 80), cell(data.region, 80),
      cell(data.postal, 20), cell(data.country, 80), cell(data.class1, 10), cell(data.class2, 10),
      'Thursday 5:30–6:15 PM Eastern', cell(data.notes), 'TEST — Not a booking'
    ]);
    const row = sheet.getLastRow();
    sheet.getRange(row, 1, 1, 20).setWrap(true).setVerticalAlignment('top');
    SpreadsheetApp.flush();
    return jsonResponse({ ok: true, row: row, testId: testId });
  } finally {
    lock.releaseLock();
  }
}
