// SOLZI Field Log — Google Apps Script
// Paste this entire file into: Extensions > Apps Script > Code.gs
// Then: Deploy > New deployment > Web app > Execute as Me > Anyone > Deploy
// Copy the web app URL and paste it as VITE_APPS_SCRIPT_URL in Vercel

const SHEET_NAME = 'Field Log'
const SPREADSHEET_ID = '1qHiWkEz5ReotEvBx1YDR12PQKRSHYcRTXEfRIzZR8CE'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
    let sheet = ss.getSheetByName(SHEET_NAME)

    // Create the tab if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME)
      sheet.appendRow(['DATE', 'TIME', 'SUBMITTED BY', 'MOVEMENT TYPE', 'CASES', 'CANS', 'TOTAL CANS', 'NOTES'])

      // Header formatting
      const headerRange = sheet.getRange(1, 1, 1, 8)
      headerRange.setFontWeight('bold')
      headerRange.setBackground('#2A1108')
      headerRange.setFontColor('#E07040')
      sheet.setFrozenRows(1)
      sheet.setColumnWidth(1, 100) // DATE
      sheet.setColumnWidth(2, 80)  // TIME
      sheet.setColumnWidth(3, 110) // SUBMITTED BY
      sheet.setColumnWidth(4, 180) // MOVEMENT TYPE
      sheet.setColumnWidth(5, 70)  // CASES
      sheet.setColumnWidth(6, 70)  // CANS
      sheet.setColumnWidth(7, 100) // TOTAL CANS
      sheet.setColumnWidth(8, 260) // NOTES
    }

    sheet.appendRow([
      data.date,
      data.time,
      data.submittedBy,
      data.movementType,
      data.cases || 0,
      data.cans || 0,
      data.totalCans,
      data.notes || '',
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Test this function manually in Apps Script editor to verify the sheet connection
function testPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        date: '06/11/2026',
        time: '10:30 AM',
        submittedBy: 'David',
        movementType: 'Strategic Seeding',
        cases: 1,
        cans: 0,
        totalCans: 12,
        notes: 'Test entry',
      })
    }
  }
  const result = doPost(fakeEvent)
  Logger.log(result.getContent())
}
