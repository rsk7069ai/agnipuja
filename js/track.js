/* Agni Puja – Track Your Booking.
   The customer enters the booking ID (shared by Agni Puja) and the phone
   number used for the booking. The Google Apps Script (setup/booking-sheet.gs)
   looks the booking up in the Google Sheet and returns only that booking's
   puja, time and status. No login is needed. */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI;
  const { $, esc, icon } = U;
  const form = $("#trackForm"), out = $("#trackResult"), er = $(".form-error", form);
  const ERRORS = {
    "not-found": "We couldn't find a booking with this ID and phone number. Please check both and try again.",
    locked: "Too many tries for this booking ID. Please wait 15 minutes, or contact us on WhatsApp.",
    missing: "Please enter your booking ID and phone number.",
    old: "Booking tracking is being set up. Please contact us on WhatsApp for your booking status.",
    network: "Could not connect. Please check your internet connection and try again."
  };
  const statusClass = (s) => /cancel/i.test(s) ? "badge-red" : /complete|done/i.test(s) ? "badge-maroon" : /confirm/i.test(s) ? "badge-green" : "badge-gold";

  const showError = (msg) => { er.innerHTML = msg; er.hidden = false; out.innerHTML = ""; };

  function show(b) {
    const help = U.waLink(`Namaste Agni Puja, I have a question about my booking ${b.id}.`);
    out.innerHTML = `<div class="panel" style="margin-top:20px">
      <p class="muted" style="margin:0">Booking ID <span class="booking-id">${esc(b.id)}</span></p>
      <h2 style="margin:6px 0 4px">${esc(b.puja)}</h2>
      <p style="margin:0 0 14px"><span class="badge ${statusClass(b.status)}">${esc(b.status)}</span></p>
      <div class="review-grid">
        <div class="review-box"><h4>Date &amp; time</h4><p>${esc(b.date)}<br><strong>${esc(b.timeIST)} IST</strong>${b.customerTime ? `<br>${esc(b.customerTime)}` : ""}</p></div>
        <div class="review-box"><h4>Type</h4><p>${esc(b.bookingType || "—")}${b.city ? `<br>${esc(b.city)}` : ""}</p></div>
        ${b.history && b.history.length > 1 ? `<div class="review-box" style="grid-column:1/-1"><h4>History</h4><p>${b.history.map((h) => `${esc(h.at)} – ${esc(h.text)}`).join("<br>")}</p></div>` : ""}
      </div>
      <p class="hint" style="margin-top:14px">${icon("info")} Namaste ${esc(b.name)}. We call you to confirm the time. Payment is after the puja. To change or cancel, please contact us.</p>
      <div class="channels" style="justify-content:flex-start"><a class="btn btn-whatsapp" href="${help}" target="_blank" rel="noopener">${icon("whatsapp")} Ask about this booking</a>
      <a class="btn btn-outline" href="tel:${esc(A.DATA.site.phoneLink)}">${icon("phone")} Call us</a></div>
    </div>`;
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // A link like track.html?id=AP261127-K7Q2M fills in the booking ID.
  const pre = U.qs("id");
  if (pre) form.id.value = pre.trim().toUpperCase();
  (pre ? form.phone : form.id).focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    er.hidden = true;
    const id = form.id.value.trim().toUpperCase(), phone = form.phone.value.trim();
    if (!id || phone.replace(/\D/g, "").length < 6) { showError(ERRORS.missing); return; }
    if (!A.endpointReady()) { showError(ERRORS.old); return; }
    const btn = $("button[type=submit]", form);
    btn.disabled = true; btn.textContent = "Checking…";
    fetch(A.DATA.site.bookingEndpoint.trim(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "track", id, phone })
    }).then((r) => r.json()).then((res) => {
      if (res && res.ok && res.booking) show(res.booking);
      else showError(ERRORS[(res && res.error) || "old"] || ERRORS.old);
    }).catch(() => showError(ERRORS.network))
      .finally(() => { btn.disabled = false; btn.textContent = "Track booking"; });
  });
})();
