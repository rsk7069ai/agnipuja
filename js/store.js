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
  const NS = "agnipuja:v1:";
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

  const countries = () => DATA.countries;
  const country = (code) => DATA.countries.find((c) => c.code === code) || null;

  const pandits = () => read("pandits", DATA.pandits);
  const savePandits = (list) => write("pandits", list);
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
    if (mode === "home" && !(p.cities || []).includes(cityName)) return false;
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

  function refundFor(b) {
    const h = hoursUntil(b.date, b.slot);
    const rule = DATA.booking.refundPolicy.find((r) => h >= r.hours);
    return rule ? { percent: rule.percent, amount: Math.round((b.total * rule.percent) / 100) } : null;
  }
  const canReschedule = (b) => b.status === "confirmed" && hoursUntil(b.date, b.slot) >= DATA.booking.rescheduleHours;
  const canCancel = (b) => b.status === "confirmed" && !!refundFor(b);

  /* ---------------- Bookings ---------------- */
  function nextBookingId() {
    const n = read("seq", 1040) + 1;
    write("seq", n);
    return "AP" + n;
  }
  const meetingLinkFor = (id) => `https://meet.jit.si/AgniPuja-${id}-${Math.random().toString(36).slice(2, 8)}`;

  function notify(b, kind) {
    const u = user(b.userId) || {};
    const p = puja(b.pujaId) || { name: b.pujaName };
    const when = `${fmtDay(b.date, b.slot)} at ${fmtTime(b.date, b.slot)} IST`;
    const text = {
      confirmed: `Booking ${b.id} confirmed: ${p.name} (${b.mode === "online" ? "online" : "at home"}) on ${when}.`,
      rescheduled: `Booking ${b.id} rescheduled to ${when}.`,
      cancelled: `Booking ${b.id} cancelled. Refund: ₹${(b.refund || 0).toLocaleString("en-IN")}.`,
      reminder: `Reminder: ${p.name} on ${when}.${b.meetingLink ? " Join: " + b.meetingLink : ""}`,
      shipped: `Prasadam for ${b.id} has been shipped${b.shipping && b.shipping.tracking ? " (tracking " + b.shipping.tracking + ")" : ""}.`
    }[kind] || kind;
    b.notifications = b.notifications || [];
    [["SMS", u.phone], ["Email", u.email], ["WhatsApp", u.phone]].forEach(([channel, to]) => {
      if (to) b.notifications.push({ channel, to, text, at: nowIso(), status: "sent (demo)" });
    });
  }

  function createBooking(input) {
    const u = currentUser();
    if (!u) throw new Error("Please log in to confirm your booking.");
    const p = puja(input.pujaId);
    if (!p) throw new Error("Please choose a puja.");
    const slot = availability({ date: input.date, mode: input.mode, city: input.city }).find((s) => s.slot === input.slot);
    if (!slot || !slot.available) throw new Error("Sorry, this slot was just taken. Please pick another time.");
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
      payment: { method: input.paymentMethod, txnId: "TXN" + Date.now().toString().slice(-9), status: "paid", paidAt: nowIso(), currency: "INR" },
      status: "confirmed", panditId: slot.pandits[0].id,
      meetingLink: input.mode === "online" ? meetingLinkFor(id) : "",
      shipping: input.mode === "online" && input.prasadam ? { status: "Awaiting puja", carrier: "", tracking: "", updatedAt: nowIso() } : null,
      reschedules: 0, history: [{ at: nowIso(), text: "Booked and paid" }], createdAt: nowIso()
    };
    notify(b, "confirmed");
    list.push(b);
    saveBookings(list);
    return b;
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
      b.history.push({ at: nowIso(), text: `Rescheduled from ${b.date} ${b.slot} to ${date} ${slot}` });
      b.date = date; b.slot = slot; b.reschedules = (b.reschedules || 0) + 1;
      notify(b, "rescheduled");
    });
  }

  function cancel(id, reason, byAdmin) {
    return updateBooking(id, (b) => {
      if (b.status === "cancelled") throw new Error("This booking is already cancelled.");
      const r = byAdmin ? { percent: 100, amount: b.total } : refundFor(b);
      if (!byAdmin && (!r || b.status !== "confirmed")) throw new Error("This booking can no longer be cancelled online. Please contact us.");
      b.status = "cancelled";
      b.refund = r.amount;
      b.payment.status = r.percent === 100 ? "refunded" : r.amount > 0 ? "partly refunded" : "paid";
      if (b.shipping) b.shipping.status = "Cancelled";
      b.history.push({ at: nowIso(), text: `Cancelled${byAdmin ? " by admin" : ""}${reason ? " – " + reason : ""}. Refund ₹${r.amount}` });
      notify(b, "cancelled");
    });
  }

  /* ---------------- Demo data (first visit only) ---------------- */
  function seed() {
    if (read("seeded", 0) >= 1) return;
    const demoUsers = [
      ["Anand Krishnan", "anand.k@example.com", "+12015550142", { line1: "24 Maple Avenue", city: "Edison", state: "New Jersey", country: "US", pin: "08817" }],
      ["Meera Subramanian", "meera.s@example.com", "+447700900123", { line1: "8 Station Road", city: "Harrow", state: "London", country: "GB", pin: "HA1 2AA" }],
      ["Lakshmi Narayanan", "lakshmi.n@example.com", "+919800000011", { line1: "12, 3rd Cross Street, Adyar", city: "Chennai", state: "Tamil Nadu", country: "IN", pin: "600020" }],
      ["Priya Raghavan", "priya.r@example.com", "+919800000022", { line1: "45 HSR Layout, Sector 2", city: "Bengaluru", state: "Karnataka", country: "IN", pin: "560102" }],
      ["Karthik Iyer", "karthik.i@example.com", "+971500000033", { line1: "Villa 9, Al Barsha 2", city: "Dubai", state: "Dubai", country: "AE", pin: "00000" }],
      ["Suresh Iyer", "suresh.i@example.com", "+919800000044", { line1: "Plot 7, Jubilee Hills", city: "Hyderabad", state: "Telangana", country: "IN", pin: "500033" }]
    ].map(([name, email, phone, address]) => newUser({ id: "demo-" + email.split("@")[0], name, email, phone, address, provider: "email", demo: true }));
    write("users", users().concat(demoUsers));

    const plan = [
      // [user index, puja, mode, day offset, slot, pandit, extras]
      [0, "thithi-shraddham", "online", -20, "19:00", "pd1", { prasadam: true, tz: "America/New_York", ship: "Delivered" }],
      [1, "tharpanam", "online", -6, "17:30", "pd2", { prasadam: true, tz: "Europe/London", ship: "Shipped" }],
      [2, "gruhapravesam", "home", -12, "07:00", "pd1", { samagri: true }],
      [3, "ayushya-homam", "home", -3, "08:30", "pd3", { samagri: true }],
      [4, "ganapathi-homam", "online", -2, "10:00", "pd7", { prasadam: true, tz: "Asia/Dubai", ship: "Packed" }],
      [5, "satyanarayana-pooja", "home", 4, "17:30", "pd3", { samagri: true }],
      [0, "tharpanam", "online", 6, "19:00", "pd1", { prasadam: false, tz: "America/New_York" }],
      [1, "navagraha-homam", "online", 9, "16:00", "pd7", { prasadam: true, tz: "Europe/London" }],
      [2, "lakshmi-pooja", "home", 11, "10:00", "pd2", { samagri: false }],
      [3, "upanayanam", "home", 25, "07:00", "pd3", { samagri: true }],
      [4, "sudarshana-homam", "online", 14, "11:30", "pd1", { prasadam: true, tz: "Asia/Dubai" }]
    ];
    const list = [];
    plan.forEach(([ui, pid, mode, off, slot, pd, x], i) => {
      const u = demoUsers[ui];
      const date = istToday(off);
      const co = country(u.address.country);
      const q = quote({ pujaId: pid, mode, city: u.address.city, samagri: x.samagri, prasadam: x.prasadam, countryCode: co.code });
      const id = "AP" + (1001 + i);
      const past = off < 0;
      const b = {
        id, userId: u.id, customerName: u.name, phone: u.phone, email: u.email, mode, pujaId: pid, pujaName: puja(pid).name,
        date, slot, tz: x.tz || "Asia/Kolkata", countryCode: co.code, nri: co.code !== "IN", city: u.address.city,
        address: u.address, language: "Tamil", details: {}, instructions: "", samagri: !!x.samagri, prasadam: !!x.prasadam,
        lines: q.lines, total: q.total,
        payment: { method: co.code === "IN" ? "UPI" : "International card", txnId: "TXN" + (550000100 + i * 7919), status: "paid", paidAt: new Date(Date.now() - (30 - off) * 3600000).toISOString(), currency: "INR" },
        status: past ? "completed" : "confirmed", panditId: pd,
        meetingLink: mode === "online" ? `https://meet.jit.si/AgniPuja-${id}-demo` : "",
        shipping: mode === "online" && x.prasadam ? { status: x.ship || "Awaiting puja", carrier: x.ship && x.ship !== "Packed" ? "India Post EMS" : "", tracking: x.ship && x.ship !== "Packed" ? "EM" + (40000 + i) + "IN" : "", updatedAt: nowIso() } : null,
        reschedules: 0, history: [{ at: nowIso(), text: "Booked and paid (sample data)" }], notifications: [], createdAt: nowIso(), demo: true
      };
      list.push(b);
    });
    write("bookings", bookings().concat(list));
    write("seeded", 1);
  }

  function resetDemo() {
    ["users", "session", "bookings", "seq", "seeded", "pujaEdits", "pujaAdded", "cities", "pandits", "notifications"].forEach((k) => {
      delete mem[NS + k];
      try { localStorage.removeItem(NS + k); } catch (e) { /* ignore */ }
    });
    seed();
  }

  seed();
  // Let the homepage (js/main.js) show admin changes to the puja list.
  DATA.pujas = pujas();

  window.Agni = {
    DATA, read, write, sRead, sWrite,
    // time
    istToDate, istToday, addDays, hoursUntil, fmtTime, fmtDay, localDateKey, localHour, weekday,
    // catalogue
    pujas, puja, editPuja, addPuja, startingPrice, cities, saveCities, city, activeCities,
    countries, country, pandits, savePandits, pandit,
    // accounts
    users, user, saveUser, currentUser, signIn, signOut, registerEmail, loginEmail, loginGoogle,
    sendOtp, verifyOtp, profileMissing, profileComplete, allAddresses, fmtAddress, normEmail, normPhone,
    // bookings
    bookings, booking, saveBookings, updateBooking, availability, nextOpenDates, quote, createBooking,
    reschedule, cancel, refundFor, canReschedule, canCancel, notify, resetDemo
  };
})();
