/**
 * ============================================================
 *  THE YELLOW CLINIC — "Lessons I Learned From Him"
 *  Google Apps Script — Paste into script.google.com
 * ============================================================
 *
 *  SETUP INSTRUCTIONS:
 *  1. Go to https://script.google.com and create a new project
 *  2. Paste this entire file into the editor
 *  3. Change SHEET_ID below to your Google Sheet ID
 *     (found in the sheet URL: .../spreadsheets/d/SHEET_ID/edit)
 *  4. Click Deploy → New Deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy the Web App URL — paste it into Vercel as GOOGLE_SCRIPT_URL
 * ============================================================
 */

const SHEET_ID = '1c0WiX9OAqIpXado_wkASj1YmBTokk9ZDMPfCbDqMOCw'
const SHEET_NAME = 'Submissions'
const DRIVE_FOLDER_NAME = 'Lessons From Him — Cards'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const { lesson, cardImageBase64, timestamp, consented } = data

    // Only log if consented
    if (!consented) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, message: 'No consent' }))
        .setMimeType(ContentService.MimeType.JSON)
    }

    // Save image to Google Drive
    let imageUrl = ''
    try {
      const imageBlob = Utilities.newBlob(
        Utilities.base64Decode(cardImageBase64.split(',')[1]),
        'image/png',
        `card-${Date.now()}.png`
      )

      let folder
      const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME)
      if (folders.hasNext()) {
        folder = folders.next()
      } else {
        folder = DriveApp.createFolder(DRIVE_FOLDER_NAME)
      }

      const file = folder.createFile(imageBlob)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
      imageUrl = file.getDownloadUrl()
    } catch (imgErr) {
      console.error('Image save error:', imgErr)
      imageUrl = 'Error saving image'
    }

    // Write row to Google Sheet
    const ss = SpreadsheetApp.openById(SHEET_ID)
    let sheet = ss.getSheetByName(SHEET_NAME)

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME)
      // Add headers on first run
      sheet.appendRow([
        'Timestamp',
        'Lesson',
        'Card Image (Download URL)',
        'Consented'
      ])
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#1B2F6B').setFontColor('#F5C518')
    }

    sheet.appendRow([
      timestamp || new Date().toISOString(),
      lesson,
      imageUrl,
      consented ? 'Yes' : 'No'
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, imageUrl }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    console.error('Script error:', err)
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Test function — run manually to check sheet connection
function testConnection() {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  Logger.log('Connected to: ' + ss.getName())
}
