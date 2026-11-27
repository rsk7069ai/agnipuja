/* =====================================================================
   AGNI PUJA – DATA LAYER (prototype)
   ---------------------------------------------------------------------
   Accounts, bookings, Pandit availability, pricing and admin changes are
   kept in this browser's localStorage, so the whole booking journey works
   on a static website with no server.

   Going live: replace the functions in this file with calls to a real
   backend (see README.md → "Going live"). The pages only talk to
   `window.Agni`, so nothing else needs to change.
   ===================================================================== */
(function () {
  "use strict";

  const DATA = window.AGNI_DATA;
  const BASE_PUJAS = DATA.pujas.slice();
  const NS = "agnipuja:v2:"; // v2: booking requests, pay after the puja
  const mem = {};

  /* ---------------- Storage helpers ---------------- */
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  function read(key, def) {
    let raw = null;
    try { raw = localStorage.getItem(NS + key); } catch (e) { /* storage blocked */ }
    if (raw == null && NS + key in mem) raw = mem[NS + key];
    if (raw == null) return clone(def);
    try { return JSON.parse(raw); } catch (e) { return clone(def); }
  }
  function write(key, value) {
    const raw = JSON.stringify(value);
    mem[NS + key] = raw;
    try { localStorage.setItem(NS + key, raw); } catch (e) { /* storage blocked */ }
  }
  function sRead(key, def) {
    try { const raw = sessionStorage.getItem(NS + key); return raw ? JSON.parse(raw) : def; } catch (e) { return def; }
  }
  function sWrite(key, value) {
    try { value == null ? sessionStorage.removeItem(NS + key) : sessionStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nowIso = () => new Date().toISOString();

  /* ---------------- Time (all slots are in IST) ---------------- */
  const IST_OFFSET = 330; // minutes
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  function istToDate(date, slot) {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0) + (toMin(slot) - IST_OFFSET) * 60000);
  }
  function istToday(offsetDays = 0) {
    const t = new Date(Date.now() + IST_OFFSET * 60000 + offsetDays * 86400000);
    return t.toISOString().slice(0, 10);
  }
  const addDays = (date, n) => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  };
  const weekday = (date) => new Date(date + "T12:00:00Z").getUTCDay();
  const hoursUntil = (date, slot) => (istToDate(date, slot) - Date.now()) / 3600000;

  function fmtTime(date, slot, tz) {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz || "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(istToDate(date, slot));
  }
  function fmtDay(date, slot, tz, long) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz || "Asia/Kolkata", weekday: long ? "long" : "short", day: "numeric", month: long ? "long" : "short", year: long ? "numeric" : undefined
    }).format(istToDate(date, slot || "12:00"));
  }
  function localDateKey(date, slot, tz) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(istToDate(date, slot));
  }
  function localHour(date, slot, tz) {
    const h = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(istToDate(date, slot));
    return parseInt(h, 10);
  }

  /* ---------------- Catalogue ---------------- */
  function pujas(includeRemoved) {
    const edits = read("pujaEdits", {});
    const added = read("pujaAdded", []);
    return BASE_PUJAS.concat(added)
      .map((p) => Object.assign({}, p, edits[p.id] || {}))
      .filter((p) => includeRemoved || !p.removed);
  }
  const puja = (id) => pujas(true).find((p) => p.id === id) || null;
  function editPuja(id, patch) {
    const edits = read("pujaEdits", {});
    edits[id] = Object.assign({}, edits[id] || {}, patch);
    write("pujaEdits", edits);
  }
  function addPuja(p) {
    const added = read("pujaAdded", []);
    added.push(p);
    write("pujaAdded", added);
  }
  const startingPrice = (p) => Math.min(...(p.modes || []).map((m) => (p.price || {})[m]).filter((n) => n > 0));

  const cities = () => read("cities", DATA.cities);
  const saveCities = (list) => write("cities", list);
  const city = (name) => cities().find((c) => c.name === name) || null;
  const activeCities = () => cities().filter((c) => c.active);

  // "Other country": use the time zone of the customer's own device
  DATA.countries.forEach((c) => {
    if (c.other && !c.zones.length) {
      let tz = "UTC";
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { /* keep UTC */ }
      if (tz === "Asia/Calcutta") tz = "Asia/Kolkata"; // older name for India's time zone
      c.zones = tz === "Asia/Kolkata" ? [["UTC", "UTC / GMT"]] : [[tz, "Your time zone (" + tz.split("/").pop().replace(/_/g, " ") + ")"], ["UTC", "UTC / GMT"]];
    }
  });
  const countries = () => DATA.countries;
  const country = (code) => DATA.countries.find((c) => c.code === code) || null;

  // Saved under a new key so browsers drop the old sample Pandit list.
  const pandits = () => read("panditList", DATA.pandits);
  const savePandits = (list) => write("panditList", list);
  const servesCity = (p, cityName) => p.cities === "all" || (p.cities || []).includes(cityName);
  const pandit = (id) => pandits().find((p) => p.id === id) || null;

  /* ---------------- Accounts ---------------- */
  const users = () => read("users", []);
  function saveUser(u) {
    const list = users();
    const i = list.findIndex((x) => x.id === u.id);
    if (i >= 0) list[i] = u; else list.push(u);
    write("users", list);
    return u;
  }
  const user = (id) => users().find((u) => u.id === id) || null;
  const currentUser = () => { const id = read("session", null); return id ? user(id) : null; };
  const signIn = (u) => { write("session", u.id); return u; };
  const signOut = () => write("session", null);

  function newUser(fields) {
    return Object.assign({
      id: uid("u"), name: "", email: "", phone: "", provider: "email",
      address: { line1: "", line2: "", city: "", state: "", country: "IN", pin: "" },
      addresses: [], createdAt: nowIso()
    }, fields);
  }

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0; return "x" + h;
    }
  }
  const normEmail = (e) => String(e || "").trim().toLowerCase();
  const normPhone = (p) => String(p || "").replace(/[^\d+]/g, "");

  async function registerEmail({ name, email, password }) {
    email = normEmail(email);
    if (users().some((u) => u.email === email)) throw new Error("An account with this email already exists. Please log in.");
    const u = newUser({ name: name.trim(), email, provider: "email", passHash: await hash(email + ":" + password) });
    saveUser(u);
    return signIn(u);
  }
  async function loginEmail(email, password) {
    email = normEmail(email);
    const u = users().find((x) => x.email === email);
    if (!u) throw new Error("No account found with this email. Please sign up first.");
    if (!u.passHash) throw new Error("This email signed up with Google or mobile OTP. Please use that option.");
    if (u.passHash !== (await hash(email + ":" + password))) throw new Error("Incorrect password. Please try again.");
    return signIn(u);
  }
  function loginGoogle({ name, email }) {
    email = normEmail(email);
    let u = users().find((x) => x.email === email);
    if (!u) u = saveUser(newUser({ name: name.trim(), email, provider: "google" }));
    return signIn(u);
  }

  /* OTP – in this prototype the code is shown on screen instead of being
     sent by SMS. A real SMS provider plugs in here. */
  const otps = {};
  function sendOtp(phone) {
    phone = normPhone(phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otps[phone] = { code, expires: Date.now() + 5 * 60000, tries: 0 };
    return code;
  }
  function verifyOtp(phone, code) {
    phone = normPhone(phone);
    const o = otps[phone];
    if (!o || Date.now() > o.expires) throw new Error("This code has expired. Please request a new one.");
    if (++o.tries > 5) throw new Error("Too many attempts. Please request a new code.");
    if (o.code !== String(code).trim()) throw new Error("Incorrect code. Please check and try again.");
    delete otps[phone];
    let u = users().find((x) => normPhone(x.phone) === phone);
    if (!u) u = saveUser(newUser({ phone, provider: "phone" }));
    return signIn(u);
  }

  function profileMissing(u) {
    if (!u) return ["login"];
    const a = u.address || {};
    const need = { name: u.name, phone: u.phone, email: u.email, address: a.line1, city: a.city, state: a.state, country: a.country, pin: a.pin };
    return Object.keys(need).filter((k) => !String(need[k] || "").trim());
  }
  const profileComplete = (u) => profileMissing(u).length === 0;

  function allAddresses(u) {
    if (!u) return [];
    const list = [];
    if (u.address && u.address.line1) list.push(Object.assign({ id: "home", label: "Home (profile)" }, u.address));
    (u.addresses || []).forEach((a) => list.push(a));
    return list;
  }
  const fmtAddress = (a) =>
    a ? [a.line1, a.line2, a.city, a.state, a.pin, (country(a.country) || {}).name || a.country].filter(Boolean).join(", ") : "";

  /* ---------------- Availability ---------------- */
  const busy = (mode) => DATA.booking.busyMinutes[mode] || 120;
  const bookings = () => read("bookings", []);
  const saveBookings = (list) => write("bookings", list);
  const booking = (id) => bookings().find((b) => b.id === id) || null;

  function panditEligible(p, date, mode, cityName) {
    if (!p.active || !(p.modes || []).includes(mode)) return false;
    if (mode === "home" && !servesCity(p, cityName)) return false;
    if ((p.weeklyOff || []).includes(weekday(date))) return false;
    if ((p.blocked || []).includes(date)) return false;
    return true;
  }
  function panditFree(p, date, slot, mode, ignoreId, list) {
    const s = toMin(slot), e = s + busy(mode);
    return !(list || bookings()).some((b) =>
      b.panditId === p.id && b.date === date && b.status !== "cancelled" && b.id !== ignoreId &&
      s < toMin(b.slot) + busy(b.mode) && toMin(b.slot) < e
    );
  }
  /* Returns every slot of the day with the Pandits free for it. */
  function availability({ date, mode, city: cityName, ignoreId }) {
    if (!date) return [];
    if (mode === "home" && !(city(cityName) || {}).active) return DATA.booking.slots.map((slot) => ({ slot, available: false, pandits: [], reason: "city" }));
    const list = bookings();
    const eligible = pandits().filter((p) => panditEligible(p, date, mode, cityName));
    return DATA.booking.slots.map((slot) => {
      if (hoursUntil(date, slot) < DATA.booking.leadHours[mode]) return { slot, available: false, pandits: [], reason: "notice" };
      const free = eligible.filter((p) => panditFree(p, date, slot, mode, ignoreId, list));
      return { slot, available: free.length > 0, pandits: free, reason: free.length ? "" : "full" };
    });
  }
  /* The next few dates that still have a free slot. */
  function nextOpenDates({ mode, city: cityName, from, count = 6 }) {
    const out = [];
    let d = from || istToday();
    for (let i = 0; i < 60 && out.length < count; i++, d = addDays(d, 1)) {
      if (availability({ date: d, mode, city: cityName }).some((s) => s.available)) out.push(d);
    }
    return out;
  }

  /* ---------------- Pricing ---------------- */
  function quote({ pujaId, mode, city: cityName, samagri, prasadam, countryCode }) {
    const p = puja(pujaId);
    if (!p) return { lines: [], total: 0 };
    const lines = [{ label: `${p.name} – ${mode === "online" ? "live online puja" : "Pandit at home"}`, note: "Pandit dakshina included", amount: (p.price || {})[mode] || 0 }];
    if (mode === "home") {
      const c = city(cityName);
      if (c && c.travel) lines.push({ label: `Pandit travel – ${c.name}`, amount: c.travel });
      if (samagri && p.samagri) lines.push({ label: "Puja samagri kit", amount: p.samagri });
    } else if (prasadam) {
      const co = country(countryCode);
      if (co && co.prasadam.available) lines.push({ label: `Prasadam packing & shipping – ${co.name}`, amount: co.prasadam.charge });
    }
    return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
  }

  /* Payment is collected after the puja (cash or bank transfer), so most
     bookings have nothing to refund. The refund rules apply only to
     bookings already marked as paid. */
  const isOpen = (b) => b.status === "pending" || b.status === "confirmed";
  const isPaid = (b) => b.payment && b.payment.status === "paid";
  function refundFor(b) {
    if (!isPaid(b)) return { percent: 0, amount: 0, none: true };
    const h = hoursUntil(b.date, b.slot);
    const rule = DATA.booking.refundPolicy.find((r) => h >= r.hours);
    return rule ? { percent: rule.percent, amount: Math.round((b.total * rule.percent) / 100) } : null;
  }
  const canReschedule = (b) => isOpen(b) && hoursUntil(b.date, b.slot) >= DATA.booking.rescheduleHours;
  const canCancel = (b) => isOpen(b) && hoursUntil(b.date, b.slot) > 0 && !!refundFor(b);

  /* ---------------- Bookings ---------------- */
  /* Booking IDs are made on the customer's own device, so a simple counter
     would give every customer the same numbers. Instead: AP + today's date
     (IST, YYMMDD) + 5 random letters/digits, e.g. AP261127-K7Q2M. Look-alike
     characters (0/O, 1/I/L) are left out so the ID is easy to read on a call. */
  function nextBookingId() {
    const ABC = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    const taken = new Set(bookings().map((b) => b.id));
    let id;
    do {
      const r = new Uint32Array(5);
      try { crypto.getRandomValues(r); } catch (e) { for (let i = 0; i < 5; i++) r[i] = Math.floor(Math.random() * 1e9); }
      id = "AP" + istToday().slice(2).replace(/-/g, "") + "-" + Array.from(r, (x) => ABC[x % ABC.length]).join("");
    } while (taken.has(id));
    return id;
  }
  const meetingLinkFor = (id) => `https://meet.jit.si/AgniPuja-${id}-${Math.random().toString(36).slice(2, 8)}`;

  function notify(b, kind) {
    const u = user(b.userId) || {};
    const p = puja(b.pujaId) || { name: b.pujaName };
    const when = `${fmtDay(b.date, b.slot)} at ${fmtTime(b.date, b.slot)} IST`;
    const text = {
      received: `Booking request ${b.id} received: ${p.name} (${b.mode === "online" ? "online" : "at home"}) on ${when}. We will call you to confirm.`,
      confirmed: `Booking ${b.id} confirmed: ${p.name} (${b.mode === "online" ? "online" : "at home"}) on ${when}.${b.meetingLink ? " Live link: " + b.meetingLink : ""}`,
      rescheduled: `Booking ${b.id}: new preferred time ${when}. We will call you to confirm.`,
      cancelled: `Booking ${b.id} cancelled.${b.refund ? " Refund: ₹" + b.refund.toLocaleString("en-IN") + "." : ""}`,
      paid: `Payment of ₹${(b.total || 0).toLocaleString("en-IN")} received for ${b.id}. Thank you!`,
      reminder: `Reminder: ${p.name} on ${when}.${b.meetingLink ? " Join: " + b.meetingLink : ""}`,
      shipped: `Prasadam for ${b.id} has been shipped${b.shipping && b.shipping.tracking ? " (tracking " + b.shipping.tracking + ")" : ""}.`
    }[kind] || kind;
    b.notifications = b.notifications || [];
    [["SMS", u.phone], ["Email", u.email], ["WhatsApp", u.phone]].forEach(([channel, to]) => {
      if (to) b.notifications.push({ channel, to, text, at: nowIso(), status: "logged" });
    });
  }

  /* Login is optional for now. Without one, the booking is saved under a
     simple customer record on this device so "My Bookings" still works. */
  function ensureCustomer(input) {
    const cur = currentUser();
    if (cur) return cur;
    const phone = normPhone(input.phone);
    let u = users().find((x) => x.provider === "guest" && normPhone(x.phone) === phone);
    if (!u) {
      const a = Object.assign({}, input.address || {});
      delete a.id; delete a.label;
      u = saveUser(newUser({ name: input.name, phone: input.phone, email: normEmail(input.email), provider: "guest", address: Object.assign(newUser({}).address, a) }));
    }
    return signIn(u);
  }

  function createBooking(input) {
    const p = puja(input.pujaId);
    if (!p) throw new Error("Please choose a puja.");
    const slot = availability({ date: input.date, mode: input.mode, city: input.city }).find((s) => s.slot === input.slot);
    if (!slot || !slot.available) throw new Error("Sorry, this time is no longer free. Please pick another time.");
    const u = ensureCustomer(input);
    const list = bookings();
    const id = nextBookingId();
    const co = country(input.countryCode) || country("IN");
    input = Object.assign({}, input, { prasadam: input.mode === "online" && !!input.prasadam, samagri: input.mode === "home" && !!input.samagri });
    const b = {
      id, userId: u.id, customerName: input.name, phone: input.phone, email: input.email,
      mode: input.mode, pujaId: p.id, pujaName: p.name, date: input.date, slot: input.slot,
      tz: input.tz || "Asia/Kolkata", countryCode: co.code, nri: co.code !== "IN",
      city: input.mode === "home" ? input.city : (input.address || {}).city || "",
      address: input.address || null, language: input.language || "",
      details: input.details || {}, instructions: input.instructions || "",
      samagri: input.samagri, prasadam: input.prasadam,
      lines: quote(input).lines, total: quote(input).total,
      payment: { method: input.paymentMethod || "Cash after the puja", txnId: "", status: "due", paidAt: null, currency: "INR" },
      status: "pending", panditId: slot.pandits[0].id,
      meetingLink: "",
      shipping: input.mode === "online" && input.prasadam ? { status: "Awaiting puja", carrier: "", tracking: "", updatedAt: nowIso() } : null,
      reschedules: 0, history: [{ at: nowIso(), text: "Booking request sent" }], createdAt: nowIso()
    };
    notify(b, "received");
    list.push(b);
    saveBookings(list);
    return b;
  }

  /* Admin: confirm after the phone call, and record payment received. */
  function confirmBooking(id) {
    return updateBooking(id, (b) => {
      if (b.status !== "pending") throw new Error("Only pending requests can be confirmed.");
      b.status = "confirmed";
      if (b.mode === "online" && !b.meetingLink) b.meetingLink = meetingLinkFor(b.id);
      b.history.push({ at: nowIso(), text: "Confirmed after call" });
      notify(b, "confirmed");
    });
  }
  function markPaid(id, method) {
    return updateBooking(id, (b) => {
      b.payment = Object.assign({}, b.payment, { status: "paid", method: method || b.payment.method, paidAt: nowIso() });
      b.history.push({ at: nowIso(), text: `Payment received (${b.payment.method})` });
      notify(b, "paid");
    });
  }

  /* ---------------- Sending requests to the owner ----------------
     Each request (and any change or cancellation) is posted to a Google
     Apps Script web app, which adds a row to your Google Sheet and emails
     you. Set site.bookingEndpoint in js/pujas-data.js – see
     GOOGLE-SHEET-SETUP.md. */
  const DETAIL_LABELS = {
    gothram: "Gothram", nakshatram: "Nakshatram", rasi: "Rasi", names: "Family names",
    departedName: "Departed", relationship: "Relationship", dateOfPassing: "Date of passing",
    vatuName: "Boy's name", vatuAge: "Age", fatherName: "Father's name"
  };
  function requestFields(type, b) {
    const co = country(b.countryCode) || {};
    return {
      type, id: b.id, status: b.status,
      sentAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      name: b.customerName, phone: b.phone, email: b.email,
      puja: b.pujaName, bookingType: b.mode === "online" ? "Online puja" : "Pandit at home",
      date: fmtDay(b.date, b.slot, null, true), timeIST: fmtTime(b.date, b.slot),
      customerTime: b.tz && b.tz !== "Asia/Kolkata" ? `${fmtTime(b.date, b.slot, b.tz)} ${fmtDay(b.date, b.slot, b.tz)} (${b.tz})` : "",
      country: co.name || b.countryCode, city: b.city, address: fmtAddress(b.address),
      samagri: b.mode === "home" ? (b.samagri ? "Yes" : "No") : "", prasadam: b.mode === "online" ? (b.prasadam ? "Yes" : "No") : "",
      estimate: b.total, payment: b.payment.method, language: b.language,
      details: Object.entries(b.details || {}).map(([k, v]) => `${DETAIL_LABELS[k] || k}: ${v}`).join("; "),
      instructions: b.instructions
    };
  }
  function requestText(type, b) {
    const f = requestFields(type, b);
    const head = { new: "New booking request", reschedule: "Booking time change request", cancel: "Booking cancelled by customer" }[type] || type;
    return [
      `Namaste Agni Puja – ${head} (${f.id})`, "",
      `Name: ${f.name}`, `Phone: ${f.phone}`, f.email ? `Email: ${f.email}` : "",
      `Puja: ${f.puja} – ${f.bookingType}`, `Preferred: ${f.date}, ${f.timeIST} IST`, f.customerTime ? `Customer's time: ${f.customerTime}` : "",
      `Country: ${f.country}`, f.city ? `City: ${f.city}` : "", f.address ? `Address: ${f.address}` : "",
      f.samagri ? `Samagri kit: ${f.samagri}` : "", f.prasadam ? `Prasadam delivery: ${f.prasadam}` : "",
      DATA.site.showPrices !== false ? `Estimated price: ₹${Number(f.estimate).toLocaleString("en-IN")}` : "", `Payment: ${f.payment}`,
      f.language ? `Language: ${f.language}` : "", f.details ? `Details: ${f.details}` : "", f.instructions ? `Instructions: ${f.instructions}` : ""
    ].filter((l, i) => l || i === 1).join("\n");
  }
  const endpointReady = () => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(String(DATA.site.bookingEndpoint || "").trim());
  function sendToOwner(type, b) {
    if (!endpointReady()) return Promise.resolve(false);
    return fetch(DATA.site.bookingEndpoint.trim(), {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(requestFields(type, b))
    }).then(() => true).catch(() => false);
  }

  function updateBooking(id, fn) {
    const list = bookings();
    const b = list.find((x) => x.id === id);
    if (!b) throw new Error("Booking not found.");
    fn(b);
    saveBookings(list);
    return b;
  }

  function reschedule(id, date, slot) {
    return updateBooking(id, (b) => {
      if (!canReschedule(b)) throw new Error("This booking can no longer be rescheduled. Please contact us.");
      const s = availability({ date, mode: b.mode, city: b.city, ignoreId: b.id }).find((x) => x.slot === slot);
      if (!s || !s.available) throw new Error("This slot is not available. Please pick another time.");
      if (!s.pandits.some((p) => p.id === b.panditId)) b.panditId = s.pandits[0].id;
      b.history.push({ at: nowIso(), text: `Time change requested: ${b.date} ${b.slot} → ${date} ${slot}` });
      b.date = date; b.slot = slot; b.reschedules = (b.reschedules || 0) + 1;
      b.status = "pending"; // to be re-confirmed on a call
      notify(b, "rescheduled");
    });
  }

  function cancel(id, reason, byAdmin) {
    return updateBooking(id, (b) => {
      if (b.status === "cancelled") throw new Error("This booking is already cancelled.");
      const paid = isPaid(b);
      const r = byAdmin ? { percent: paid ? 100 : 0, amount: paid ? b.total : 0 } : refundFor(b);
      if (!byAdmin && (!r || !isOpen(b))) throw new Error("This booking can no longer be cancelled online. Please contact us.");
      b.status = "cancelled";
      b.refund = r.amount;
      if (paid) b.payment.status = r.percent === 100 ? "refunded" : r.amount > 0 ? "partly refunded" : "paid";
      else b.payment.status = "not charged";
      if (b.shipping) b.shipping.status = "Cancelled";
      b.history.push({ at: nowIso(), text: `Cancelled${byAdmin ? " by admin" : " by customer"}${reason ? " – " + reason : ""}${r.amount ? ". Refund ₹" + r.amount : ""}` });
      notify(b, "cancelled");
    });
  }

  /* ---------------- Remove old sample data ----------------
     Earlier versions added sample customers and bookings on the first visit.
     Clear them (once) from browsers that still have them. */
  function removeSampleData() {
    if (read("samplesRemoved", 0) >= 1) return;
    const keepUsers = users().filter((u) => !u.demo);
    const keepBookings = bookings().filter((b) => !b.demo);
    write("users", keepUsers);
    write("bookings", keepBookings);
    const s = read("session", null);
    if (s && !keepUsers.some((u) => u.id === s)) write("session", null);
    write("samplesRemoved", 1);
  }
  removeSampleData();

  // Let the homepage (js/main.js) show admin changes to the puja list.
  DATA.pujas = pujas();

  window.Agni = {
    DATA, read, write, sRead, sWrite,
    // time
    istToDate, istToday, addDays, hoursUntil, fmtTime, fmtDay, localDateKey, localHour, weekday,
    // catalogue
    pujas, puja, editPuja, addPuja, startingPrice, cities, saveCities, city, activeCities,
    countries, country, pandits, savePandits, pandit, servesCity,
    // accounts
    users, user, saveUser, currentUser, signIn, signOut, registerEmail, loginEmail, loginGoogle,
    sendOtp, verifyOtp, profileMissing, profileComplete, allAddresses, fmtAddress, normEmail, normPhone,
    // bookings
    bookings, booking, saveBookings, updateBooking, availability, nextOpenDates, quote, createBooking,
    reschedule, cancel, refundFor, canReschedule, canCancel, notify,
    confirmBooking, markPaid, isOpen, isPaid, sendToOwner, requestText, endpointReady
  };
})();
