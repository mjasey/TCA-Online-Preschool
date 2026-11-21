// Production receiver, reached only after doPost verifies SUBMISSION_SECRET.
const FREE_TRIAL_TAB = 'Free Trials';
const FREE_TRIAL_RECIPIENT = 'sherri.taylor@hotmail.com';

function handleFreeTrial(payload) {
  const data = payload.trial || {};
  if (!data.requestId || !data.parentName || !data.email || !data.childName || !data.class1 || !data.class2) {
    return jsonResponse({ok:false,error:'Missing trial details'});
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse({ok:false,error:'Please retry'});
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(FREE_TRIAL_TAB);
    if (!sheet) return jsonResponse({ok:false,error:'Trial tab unavailable'});
    const cell = function(value,max) {
      const text = cleanValue(value,max || 1000);
      return /^[=+\-@]/.test(text) ? "'" + text : text;
    };
    // Checkbox values in unused rows must never push real requests to the bottom.
    const submitted = sheet.getRange(1,1,sheet.getLastRow(),1).getValues();
    let lastDataRow = submitted.length;
    while (lastDataRow > 1 && !submitted[lastDataRow-1][0]) lastDataRow--;
    let row = 0;
    if (lastDataRow > 1) {
      const found = sheet.getRange(2,26,lastDataRow-1,1).createTextFinder(data.requestId).matchEntireCell(true).findNext();
      if (found) row = found.getRow();
    }
    // New submissions from the same email are separate rows; network retries reuse an ID.
    if (!row) {
      row = lastDataRow + 1;
      if (row > sheet.getMaxRows()) sheet.insertRowAfter(lastDataRow);
      sheet.getRange(row,1,1,26).setValues([[
        Utilities.formatDate(new Date(),'America/New_York','yyyy-MM-dd HH:mm:ss'),
        cell(data.parentName,100),cell(data.email,254),cell(data.phone,40),cell(data.childName,100),cell(data.childAge,30),
        cell(data.class1,10),cell(data.class2,10),'Thursday 5:30–6:15 PM Eastern','New',
        false,false,false,false,'',
        cell(data.dob,10),cell(data.interests),cell(data.street,160),cell(data.unit,60),cell(data.city,80),cell(data.region,80),
        "'" + cleanValue(data.postal,20),cell(data.country,80),cell(data.notes),'Pending',cell(data.requestId,80)
      ]]);
      sheet.getRange(row,11,1,4).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
      sheet.getRange(row,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
      sheet.getRange(row,7,1,2).setNumberFormat('ddd, mmm d, yyyy');
      sheet.getRange(row,16).setNumberFormat('yyyy-mm-dd');
      sheet.getRange(row,1,1,26).setWrap(true).setVerticalAlignment('top');
      SpreadsheetApp.flush();
    }
    if (String(sheet.getRange(row,25).getValue()).indexOf('Sent') === 0) return jsonResponse({ok:true,row:row});
    // One alert per request. Never expose DOB, address, or child details in email alerts.
    const sheetUrl = spreadsheet.getUrl() + '#gid=' + sheet.getSheetId();
    try {
      MailApp.sendEmail({
        to:FREE_TRIAL_RECIPIENT,
        subject:'[TCA Free Trial] New request from ' + cleanValue(data.parentName,100).replace(/[\r\n]/g,' '),
        replyTo:cleanValue(data.email,254),
        name:'TCA Website',
        body:[
          'A new request for two free TCA classes is ready to review.',
          '',
          'Parent / guardian: ' + cleanValue(data.parentName,100),
          'Requested Thursdays: ' + cleanValue(data.class1,10) + ' and ' + cleanValue(data.class2,10),
          'Class time: 5:30–6:15 PM Eastern',
          '',
          'Open the private Free Trials spreadsheet:',
          sheetUrl,
          '',
          'Next: confirm dates with the parent, mail materials, and send class instructions.',
          'Track materials and both attended classes in the sheet. After both classes, invite the family to register:',
          'https://enroll.tcaarts.org/enroll.html#plans',
          '',
          'Reply to this email to contact the parent directly.'
        ].join('\n')
      });
      sheet.getRange(row,25).setValue('Sent ' + Utilities.formatDate(new Date(),'America/New_York','yyyy-MM-dd HH:mm:ss'));
      SpreadsheetApp.flush();
      return jsonResponse({ok:true,row:row});
    } catch (error) {
      sheet.getRange(row,25).setValue('Needs attention — email not sent');
      SpreadsheetApp.flush();
      console.error('Trial saved; alert needs retry.');
      // Ask the caller to retry using the same ID; preserve the already-saved row.
      return jsonResponse({ok:false,error:'Alert needs retry'});
    }
  } finally {
    lock.releaseLock();
  }
}
