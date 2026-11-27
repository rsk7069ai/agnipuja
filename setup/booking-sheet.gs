/* =====================================================================
   AGNI PUJA – BOOKING REQUESTS → GOOGLE SHEET + EMAIL
   ---------------------------------------------------------------------
   Paste this whole file into Extensions → Apps Script of your Google
   Sheet, then deploy it as a web app. Step-by-step instructions:
   GOOGLE-SHEET-SETUP.md
   ===================================================================== */

// Leave empty to email the Google account that owns this sheet,
// or put another address in the quotes.
const NOTIFY_EMAIL = "rsk7069ai@gmail.com";

const COLUMNS = [
  ["sentAt", "Received (IST)"], ["type", "Type"], ["id", "Request ID"],
  ["name", "Name"], ["phone", "Phone"], ["email", "Email"],
  ["puja", "Puja"], ["bookingType", "Booking type"],
  ["date", "Preferred date"], ["timeIST", "Time (IST)"], ["customerTime", "Customer's local time"],
  ["country", "Country"], ["city", "City"], ["address", "Address"],
  ["samagri", "Samagri kit"], ["prasadam", "Prasadam delivery"],
  ["estimate", "Estimated price (₹)"], ["payment", "Payment"],
  ["language", "Language"], ["details", "Puja details"], ["instructions", "Instructions"],
  // You can edit Status in the sheet (e.g. Confirmed, Completed). Customers see
  // it on the website's Track Booking page.
  ["status", "Status"]
];
const STATUS = { pending: "Pending – we will call you", cancelled: "Cancelled" };
const TYPES = { new: "New booking", reschedule: "Time change", cancel: "Cancelled by customer" };

// The admin page reads bookings with a secret admin key. The key is NOT
// written in this file (the code is public on GitHub). Set it in Apps Script:
// Project Settings (gear icon) → Script Properties → Add property
//   Property: ADMIN_KEY    Value: a long secret, e.g. 3–4 random words
const MAX_FAILS = 10;        // wrong keys allowed …
const LOCK_SECONDS = 900;    // … before reading is blocked for 15 minutes

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data && data.action === "list") return reply(listBookings(data.key));
    if (data && data.action === "track") return reply(trackBooking(data.id, data.phone));
    if (!data || !TYPES[data.type] || !data.name || !data.phone) return reply({ ok: false });
    const row = COLUMNS.map(([key]) => (key === "type" ? TYPES[data.type]
      : key === "status" ? (data.type === "cancel" ? STATUS.cancelled : STATUS.pending)
      : clean(data[key])));

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

// Reads the sheet as objects keyed like COLUMNS (matched by header text).
function readRows() {
  const values = getSheet().getDataRange().getDisplayValues();
  const byLabel = {};
  COLUMNS.forEach(([k, label]) => { byLabel[label] = k; });
  const keys = (values[0] || []).map((label) => byLabel[label] || label);
  return values.slice(1).map((r, i) => {
    const o = { row: i + 2 };
    keys.forEach((k, j) => { o[k] = r[j]; });
    return o;
  }).filter((o) => o.id || o.name);
}

const digits = (s) => String(s || "").replace(/\D/g, "");

// Track Booking page: a customer gets their own booking by booking ID plus
// the phone number used for it. Only puja, time and status are returned.
function trackBooking(id, phone) {
  id = String(id || "").trim().toUpperCase();
  const ph = digits(phone).slice(-10);
  if (!id || ph.length < 6) return { ok: false, error: "missing" };
  const cache = CacheService.getScriptCache();
  const failKey = "trackFails:" + id;
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= MAX_FAILS) return { ok: false, error: "locked" };
  const rows = readRows().filter((r) => String(r.id).trim().toUpperCase() === id && digits(r.phone).slice(-10) === ph);
  if (!rows.length) {
    cache.put(failKey, String(fails + 1), LOCK_SECONDS);
    return { ok: false, error: "not-found" };
  }
  const first = rows[0], last = rows[rows.length - 1];
  const cancelled = rows.some((r) => r.type === TYPES.cancel);
  // Status of the newest row for this booking (a time change starts again as
  // pending until you update it). A cancellation always shows as cancelled.
  const status = cancelled ? STATUS.cancelled : (rows.map((r) => r.status).filter(Boolean).pop() || STATUS.pending);
  return {
    ok: true,
    booking: {
      id: first.id, name: String(first.name || "").split(" ")[0], puja: first.puja, bookingType: first.bookingType,
      date: last.date, timeIST: last.timeIST, customerTime: last.customerTime, city: first.city,
      receivedAt: first.sentAt, status,
      history: rows.map((r) => ({ at: r.sentAt, text: r.type }))
    }
  };
}

// Returns every row of the sheet to the admin page, newest first.
function listBookings(key) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get("adminFails") || 0);
  if (fails >= MAX_FAILS) return { ok: false, error: "locked" };
  const realKey = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY") || "";
  if (realKey.length < 8) return { ok: false, error: "key-not-set" };
  if (String(key || "") !== realKey) {
    cache.put("adminFails", String(fails + 1), LOCK_SECONDS);
    return { ok: false, error: "bad-key" };
  }
  cache.remove("adminFails");
  return { ok: true, rows: readRows().reverse() };
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Booking requests");
  if (!sheet) {
    sheet = ss.insertSheet("Booking requests", 0);
    sheet.appendRow(COLUMNS.map((c) => c[1]));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#f3e6c4");
  } else if (sheet.getLastColumn() < COLUMNS.length) {
    // Sheet made by an older version: add the new header(s), e.g. Status.
    const from = sheet.getLastColumn() + 1;
    const extra = COLUMNS.slice(from - 1).map((c) => c[1]);
    sheet.getRange(1, from, 1, extra.length).setValues([extra]).setFontWeight("bold").setBackground("#f3e6c4");
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
