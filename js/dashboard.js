/* Agni Puja – customer dashboard */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI;
  const { $, $$, esc, icon, money } = U;
  const me = U.requireLogin();
  if (!me) return;

  const SHIP_STEPS = ["Awaiting puja", "Packed", "Shipped", "Delivered"];
  const TABS = [
    ["overview", "Overview", "home"],
    ["bookings", "My Bookings", "calendar"],
    ["links", "Live Puja Links", "video"],
    ["prasadam", "Prasadam Delivery", "truck"],
    ["payments", "Payments", "card"],
    ["addresses", "Saved Addresses", "pin"],
    ["profile", "My Profile", "user"]
  ];
  let filter = "upcoming";

  const user = () => A.user(me.id);
  const mine = () => A.bookings().filter((b) => b.userId === me.id);
  const isUpcoming = (b) => b.status === "confirmed" && A.hoursUntil(b.date, b.slot) > -3;
  const sortAsc = (a, b) => A.istToDate(a.date, a.slot) - A.istToDate(b.date, b.slot);
  const tab = () => (TABS.some((t) => t[0] === location.hash.slice(1)) ? location.hash.slice(1) : "overview");

  function nav() {
    const all = mine();
    const counts = {
      bookings: all.filter(isUpcoming).length,
      links: all.filter((b) => isUpcoming(b) && b.mode === "online").length,
      prasadam: all.filter((b) => b.shipping && !["Delivered", "Cancelled"].includes(b.shipping.status)).length
    };
    $("#dashNav").innerHTML = TABS.map(([k, l, ic]) =>
      `<a href="#${k}" class="${k === tab() ? "active" : ""}"${k === tab() ? ' aria-current="page"' : ""}>${icon(ic)} ${l}${counts[k] ? `<span class="count">${counts[k]}</span>` : ""}</a>`).join("");
    const active = $("#dashNav a.active");
    if (active && active.scrollIntoView && window.innerWidth < 920) active.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function when(b) {
    const local = b.tz && b.tz !== "Asia/Kolkata";
    return `${A.fmtDay(b.date, b.slot, b.tz, true)}, <strong>${A.fmtTime(b.date, b.slot, b.tz)}</strong>${local ? ` your time · ${A.fmtTime(b.date, b.slot)} IST` : " IST"}`;
  }

  function track(status) {
    const i = SHIP_STEPS.indexOf(status);
    return `<ol class="track">${SHIP_STEPS.map((s, j) => `<li class="${j <= i ? "on" : ""}">${s}</li>`).join("")}</ol>`;
  }

  function card(b) {
    const pd = A.pandit(b.panditId) || {};
    const d = new Date(b.date + "T12:00:00Z");
    const up = isUpcoming(b);
    const soon = up && A.hoursUntil(b.date, b.slot) < 1;
    return `<article class="bk">
      <div class="bk-date"><span>${d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}</span><b>${d.getUTCDate()}</b><span>${d.toLocaleString("en-GB", { weekday: "short", timeZone: "UTC" })}</span></div>
      <div>
        <div class="bk-badges">${U.modeBadge(b.mode)} ${U.statusBadge(b.status)} ${b.nri ? `<span class="badge">${icon("globe")} NRI</span>` : ""}</div>
        <h3>${esc(b.pujaName)}</h3>
        <ul class="bk-meta">
          <li>${icon("clock")}<span>${when(b)}</span></li>
          <li>${icon("priest")}<span>${esc(pd.name || "Pandit being assigned")}</span></li>
          ${b.mode === "home" ? `<li>${icon("pin")}<span>${esc(A.fmtAddress(b.address))}</span></li>` : ""}
          ${b.mode === "online" && up ? `<li>${icon("video")}<span><a class="link-btn" href="${esc(b.meetingLink)}" target="_blank" rel="noopener">${esc(b.meetingLink.replace("https://", ""))}</a></span></li>` : ""}
          <li>${icon("card")}<span>${money(b.total)} · ${esc(b.payment.status)}${b.refund ? ` · refund ${money(b.refund)}` : ""} · <small>ID ${b.id}</small></span></li>
        </ul>
        ${b.shipping && b.status !== "cancelled" ? track(b.shipping.status) : ""}
      </div>
      <div class="bk-actions">
        ${b.mode === "online" && up ? `<a class="btn ${soon ? "btn-primary" : "btn-soft"} btn-sm" href="${esc(b.meetingLink)}" target="_blank" rel="noopener">${icon("video")} Join puja</a>` : ""}
        ${A.canReschedule(b) ? `<button class="btn btn-outline btn-sm" data-resched="${b.id}">${icon("refresh")} Reschedule</button>` : ""}
        ${A.canCancel(b) ? `<button class="btn btn-link btn-sm" data-cancel="${b.id}">Cancel</button>` : ""}
        ${up ? `<a class="btn btn-link btn-sm" href="${U.icsFor(b)}" download="${b.id}.ics">Add to calendar</a>` : ""}
        ${b.status === "completed" ? `<a class="btn btn-soft btn-sm" href="book.html?mode=${b.mode}&puja=${esc(b.pujaId)}">Book again</a>` : ""}
        <a class="btn btn-link btn-sm" href="${U.waLink(`Namaste, I need help with booking ${b.id} (${b.pujaName}).`)}" target="_blank" rel="noopener">${icon("whatsapp")} Help</a>
      </div>
    </article>`;
  }

  const empty = (title, text, cta = true) => `<div class="empty"><span class="feature-icon">${icon("flame")}</span><h3>${title}</h3><p>${text}</p>${cta ? `<a class="btn btn-primary" href="book.html">Book a Puja</a>` : ""}</div>`;

  /* ---------------- Views ---------------- */
  const VIEWS = {
    overview() {
      const all = mine(), up = all.filter(isUpcoming).sort(sortAsc);
      const paid = all.reduce((s, b) => s + b.total - (b.refund || 0), 0);
      const missing = A.profileMissing(user());
      return `
        ${missing.length ? `<p class="notice notice-warn">${icon("info")}<span>Your profile is incomplete (${missing.join(", ")}). <a class="link-btn" href="profile.html?next=dashboard.html">Complete it</a> to book faster.</span></p>` : ""}
        <div class="kpis">
          <div class="kpi"><span>Upcoming</span><strong>${up.length}</strong></div>
          <div class="kpi"><span>Completed</span><strong>${all.filter((b) => b.status === "completed").length}</strong></div>
          <div class="kpi"><span>Online / Home</span><strong>${all.filter((b) => b.mode === "online").length} / ${all.filter((b) => b.mode === "home").length}</strong></div>
          <div class="kpi"><span>Total paid</span><strong>${money(paid)}</strong></div>
        </div>
        <div class="dash-head"><div><h2>Next puja</h2></div><a class="btn btn-primary" href="book.html">${icon("plus")} Book a Puja</a></div>
        ${up[0] ? card(up[0]) : empty("No upcoming pujas", "Book an online puja or a Pandit at home in a few steps.")}
        ${up.length > 1 ? `<p style="margin-top:14px"><a class="link-btn" href="#bookings">See all ${up.length} upcoming bookings</a></p>` : ""}`;
    },
    bookings() {
      const all = mine();
      const groups = {
        upcoming: all.filter(isUpcoming).sort(sortAsc),
        history: all.filter((b) => !isUpcoming(b)).sort((a, b) => sortAsc(b, a)),
        all: all.slice().sort((a, b) => sortAsc(b, a))
      };
      const list = groups[filter];
      return `<div class="dash-head"><div><h2>My Bookings</h2><p>Reschedule up to 24 hours before. Cancel 48+ hours before for a full refund.</p></div></div>
        <div class="filters" style="justify-content:flex-start;margin:0 0 18px">
          ${[["upcoming", "Upcoming"], ["history", "Booking history"], ["all", "All"]].map(([k, l]) => `<button class="chip${filter === k ? " active" : ""}" data-filter="${k}">${l} (${groups[k].length})</button>`).join("")}
        </div>
        ${list.length ? list.map(card).join("") : empty(filter === "upcoming" ? "No upcoming pujas" : "No bookings yet", "Your bookings will appear here.")}`;
    },
    links() {
      const list = mine().filter((b) => b.mode === "online" && isUpcoming(b)).sort(sortAsc);
      return `<div class="dash-head"><div><h2>Live Puja Links</h2><p>Join from your phone or computer about 10 minutes before the start time.</p></div></div>
        ${list.length ? list.map((b) => `<div class="meet-box">
          <div><strong>${esc(b.pujaName)}</strong> · ${when(b)}<br><code>${esc(b.meetingLink)}</code></div>
          <a class="btn btn-primary" href="${esc(b.meetingLink)}" target="_blank" rel="noopener">${icon("video")} Join puja</a></div>`).join("")
          : empty("No live pujas coming up", "Book an online puja and your video link will appear here.")}`;
    },
    prasadam() {
      const list = mine().filter((b) => b.shipping).sort((a, b) => sortAsc(b, a));
      return `<div class="dash-head"><div><h2>Prasadam Delivery</h2><p>Prasadam is packed after your puja and shipped to your address.</p></div></div>
        ${list.length ? list.map((b) => `<div class="panel">
          <div class="dash-head" style="margin-bottom:6px"><div><h3 style="margin:0">${esc(b.pujaName)}</h3><p>${A.fmtDay(b.date, b.slot, b.tz, true)} · ${esc(A.fmtAddress(b.address))}</p></div>
          <span class="badge ${b.shipping.status === "Delivered" ? "badge-green" : b.shipping.status === "Cancelled" ? "badge-red" : "badge-saffron"}">${esc(b.shipping.status)}</span></div>
          ${b.shipping.status !== "Cancelled" ? track(b.shipping.status) : ""}
          ${b.shipping.tracking ? `<p class="hint" style="margin-top:14px">${icon("truck")} ${esc(b.shipping.carrier)} · tracking <strong>${esc(b.shipping.tracking)}</strong></p>` : ""}
        </div>`).join("") : empty("No Prasadam deliveries", "Choose Prasadam delivery when booking an online puja.")}`;
    },
    payments() {
      const list = mine().sort((a, b) => new Date(b.payment.paidAt) - new Date(a.payment.paidAt));
      return `<div class="dash-head"><div><h2>Payment History</h2><p>All amounts in Indian Rupees.</p></div></div>
        ${list.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>Date</th><th>Booking</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>${list.map((b) => `<tr>
            <td>${new Date(b.payment.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
            <td><strong>${esc(b.pujaName)}</strong><small>${b.id} · ${esc(b.payment.txnId)}</small></td>
            <td>${esc(b.payment.method)}</td>
            <td>${money(b.total)}${b.refund ? `<small>Refunded ${money(b.refund)}</small>` : ""}</td>
            <td><span class="badge ${b.payment.status === "paid" ? "badge-green" : "badge-gold"}">${esc(b.payment.status)}</span></td></tr>`).join("")}</tbody>
        </table></div>` : empty("No payments yet", "Payments for your bookings will appear here.")}`;
    },
    addresses() {
      const u = user();
      const list = A.allAddresses(u);
      return `<div class="dash-head"><div><h2>Saved Addresses</h2><p>Used for at-home pujas and Prasadam delivery.</p></div><button class="btn btn-primary" data-addr-new>${icon("plus")} Add address</button></div>
        ${list.length ? `<div class="addr-grid">${list.map((a) => `<div class="addr">
          <h4>${esc(a.label || "Address")} ${a.id === "home" ? `<span class="badge badge-gold">Default</span>` : ""}</h4>
          <p>${esc(A.fmtAddress(a))}</p>
          <div class="row-actions">${a.id === "home" ? `<a class="btn btn-link btn-sm" href="profile.html?next=dashboard.html%23addresses">${icon("edit")} Edit</a>` : `<button class="btn btn-link btn-sm" data-addr-del="${esc(a.id)}">${icon("trash")} Remove</button>`}</div>
        </div>`).join("")}</div>` : empty("No saved addresses", "Add an address to book faster.", false)}`;
    },
    profile() {
      const u = user(), a = u.address || {};
      return `<div class="dash-head"><div><h2>My Profile</h2><p>Signed in with ${u.provider === "google" ? "Google" : u.provider === "phone" ? "mobile OTP" : "email"}.</p></div><a class="btn btn-primary" href="profile.html?next=dashboard.html%23profile">${icon("edit")} Edit profile</a></div>
        <div class="panel"><div class="review-grid" style="margin:0">
          <div class="review-box"><h4>Name</h4><p>${esc(u.name || "—")}</p></div>
          <div class="review-box"><h4>Mobile</h4><p>${esc(u.phone || "—")}</p></div>
          <div class="review-box"><h4>Email</h4><p>${esc(u.email || "—")}</p></div>
          <div class="review-box"><h4>Country</h4><p>${esc((A.country(a.country) || {}).name || a.country || "—")}</p></div>
          <div class="review-box" style="grid-column:1/-1"><h4>Address</h4><p>${esc(A.fmtAddress(a) || "—")}</p></div>
        </div></div>
        <p style="margin-top:20px"><button class="btn btn-outline" data-logout-btn>${icon("logout")} Log out</button></p>`;
    }
  };

  /* ---------------- Actions ---------------- */
  function rescheduleBox(id) {
    const b = A.booking(id);
    const m = U.modal(`<h3>Reschedule ${esc(b.pujaName)}</h3>
      <p class="modal-intro">Currently: ${when(b)}. Choose a new date and time.</p>
      <div id="rsPicker"></div>
      <p class="form-error" hidden></p>
      <div class="form-actions"><button class="btn btn-outline" data-x>Keep current time</button><button class="btn btn-primary" data-rs-ok disabled>Confirm new time</button></div>`, { wide: true });
    let pick = {};
    U.slotPicker($("#rsPicker", m.el), {
      mode: () => b.mode, city: () => b.city, tz: () => b.tz, ignoreId: b.id,
      onChange: (st) => { pick = st; $("[data-rs-ok]", m.el).disabled = !(st.date && st.slot); }
    });
    $("[data-rs-ok]", m.el).addEventListener("click", () => {
      try {
        A.reschedule(b.id, pick.date, pick.slot);
        m.close();
        U.toast(`Rescheduled. New confirmation sent by SMS, email and WhatsApp (demo).`);
        render();
      } catch (e) { const er = $(".form-error", m.el); er.textContent = e.message; er.hidden = false; }
    });
  }

  async function cancelBox(id) {
    const b = A.booking(id);
    const r = A.refundFor(b);
    const ok = await U.confirmBox(`Cancel ${b.pujaName}?`,
      `${when(b)}.<br><br>Under our policy you will receive a refund of <strong>${money(r.amount)}</strong> (${r.percent}%) to your original payment method within 5–7 working days. This cannot be undone.`,
      "Cancel booking", true);
    if (!ok) return;
    try { A.cancel(b.id); U.toast(`Booking ${b.id} cancelled. Refund of ${money(r.amount)} started.`); render(); }
    catch (e) { U.toast(e.message, "error"); }
  }

  function newAddressBox() {
    const m = U.modal(`<h3>Add an address</h3>
      <form class="form" novalidate>
        <label class="field">Label<input name="label" placeholder="e.g. Parents' home, Office"></label>
        <label class="field">Country<select name="country">${A.countries().map((c) => `<option value="${c.code}">${esc(c.name)}</option>`).join("")}</select></label>
        <label class="field">Address line 1 <span class="req">*</span><input name="line1" required></label>
        <label class="field">Address line 2<input name="line2"></label>
        <div class="form-row-3">
          <label class="field">City <span class="req">*</span><input name="city" required list="dashCities"></label>
          <label class="field">State <span class="req">*</span><input name="state" required></label>
          <label class="field">PIN / ZIP <span class="req">*</span><input name="pin" required></label>
        </div>
        <datalist id="dashCities">${A.activeCities().map((c) => `<option value="${esc(c.name)}">`).join("")}</datalist>
        <p class="form-error" hidden></p>
        <button class="btn btn-primary" type="submit">Save address</button>
      </form>`);
    const f = $("form", m.el);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      let bad = false;
      $$("[required]", f).forEach((el) => { const x = !el.value.trim(); el.classList.toggle("invalid", x); bad = bad || x; });
      if (bad) { const er = $(".form-error", f); er.textContent = "Please fill in the required fields."; er.hidden = false; return; }
      const u = user();
      const g = (k) => f[k].value.trim();
      const addr = { id: "a" + Date.now().toString(36), label: g("label") || "Address", country: g("country"), line1: g("line1"), line2: g("line2"), city: g("city"), state: g("state"), pin: g("pin") };
      if (!u.address || !u.address.line1) { u.address = Object.assign({}, addr); delete u.address.id; delete u.address.label; }
      else u.addresses = (u.addresses || []).concat(addr);
      A.saveUser(u);
      m.close();
      U.toast("Address saved.");
      render();
    });
  }

  $("#dashMain").addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset.filter) { filter = t.dataset.filter; render(); }
    else if (t.dataset.resched) rescheduleBox(t.dataset.resched);
    else if (t.dataset.cancel) cancelBox(t.dataset.cancel);
    else if (t.hasAttribute("data-addr-new")) newAddressBox();
    else if (t.dataset.addrDel) {
      U.confirmBox("Remove this address?", "It will be removed from your saved addresses.", "Remove", true).then((ok) => {
        if (!ok) return;
        const u = user(); u.addresses = (u.addresses || []).filter((a) => a.id !== t.dataset.addrDel); A.saveUser(u); render();
      });
    } else if (t.hasAttribute("data-logout-btn")) { A.signOut(); location.href = "index.html"; }
  });

  function render() {
    const u = user();
    $("#hello").textContent = `Namaste${u.name ? ", " + u.name.split(" ")[0] : ""}`;
    nav();
    $("#dashMain").innerHTML = VIEWS[tab()]();
  }
  window.addEventListener("hashchange", () => { render(); window.scrollTo({ top: $(".dash").getBoundingClientRect().top + scrollY - 100, behavior: "smooth" }); });
  render();
})();
