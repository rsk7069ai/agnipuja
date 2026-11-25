/* =====================================================================
   AGNI PUJA – BOOKING REQUESTS → GOOGLE SHEET + EMAIL
   ---------------------------------------------------------------------
   Paste this whole file into Extensions → Apps Script of your Google
   Sheet, then deploy it as a web app. Step-by-step instructions:
   GOOGLE-SHEET-SETUP.md
   ===================================================================== */

// Leave empty to email the Google account that owns this sheet,
// or put another address in the quotes.
const NOTIFY_EMAIL = "";

const COLUMNS = [
  ["sentAt", "Received (IST)"], ["type", "Type"], ["id", "Request ID"],
  ["name", "Name"], ["phone", "Phone"], ["email", "Email"],
  ["puja", "Puja"], ["bookingType", "Booking type"],
  ["date", "Preferred date"], ["timeIST", "Time (IST)"], ["customerTime", "Customer's local time"],
  ["country", "Country"], ["city", "City"], ["address", "Address"],
  ["samagri", "Samagri kit"], ["prasadam", "Prasadam delivery"],
  ["estimate", "Estimated price (₹)"], ["payment", "Payment"],
  ["language", "Language"], ["details", "Puja details"], ["instructions", "Instructions"]
];
const TYPES = { new: "New booking", reschedule: "Time change", cancel: "Cancelled by customer" };

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data || !TYPES[data.type] || !data.name || !data.phone) return reply({ ok: false });
    const row = COLUMNS.map(([key]) => (key === "type" ? TYPES[data.type] : clean(data[key])));

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try { getSheet().appendRow(row); } finally { lock.releaseLock(); }

    MailApp.sendEmail({
      to: NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(),
      subject: `${TYPES[data.type]}: ${clean(data.puja)} – ${clean(data.name)} (${clean(data.id)})`,
      body: COLUMNS.map(([key, label], i) => `${label}: ${row[i]}`).join("\n")
    });
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false });
  }
}

// Opening the web app link in a browser shows this – handy to check it works.
function doGet() {
  return reply({ ok: true, message: "Agni Puja booking requests are being received." });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Booking requests");
  if (!sheet) {
    sheet = ss.insertSheet("Booking requests", 0);
    sheet.appendRow(COLUMNS.map((c) => c[1]));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#f3e6c4");
  }
  return sheet;
}

// Keep values short, and stop text from being read as a spreadsheet formula.
function clean(value) {
  let s = value == null ? "" : String(value).slice(0, 1000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
