/* Agni Puja – admin panel (prototype).
   In the live version this page must be protected by a server-side admin
   login; here it works on the data saved in this browser. */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI;
  const { $, $$, esc, icon, money } = U;
  const root = $("#adminRoot");
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const SHIP = ["Awaiting puja", "Packed", "Shipped", "Delivered", "Cancelled"];
  const TABS = [
    ["overview", "Reports", "chart"], ["bookings", "Bookings", "calendar"], ["pandits", "Pandits", "priest"],
    ["cities", "Locations", "pin"], ["pujas", "Puja Services", "flame"], ["customers", "Customers", "users"],
    ["payments", "Payments", "card"], ["shipping", "Prasadam Shipping", "truck"], ["notify", "Notifications", "bell"]
  ];
  const ui = { q: "", type: "all", status: "all" };

  /* ---------------- Password screen ----------------
     Only a SHA-256 hash of the password is stored here, never the password.
     This keeps casual visitors out; real security needs a server login
     (see README → Going live). To change the password, replace ADMIN_HASH
     with the SHA-256 of "agnipuja-admin:" + your new password. */
  const ADMIN_HASH = "fbe59e719b20e721d236a0083b78d151750fd1cf6ddd6214835fbae7e45c177c";
  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  if (A.sRead("adminOk", "") !== ADMIN_HASH) {
    root.innerHTML = `<form class="panel admin-gate form" id="adminLogin" novalidate>
      <span class="feature-icon" style="margin:0 auto">${icon("lock")}</span>
      <h2>Admin login</h2>
      <p class="panel-intro" style="margin:0">Enter the admin password to manage bookings, Pandits and pujas.</p>
      <label class="field" style="text-align:left">Password<input type="password" name="pw" autocomplete="current-password" required></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary btn-lg" type="submit">Log in</button>
    </form>`;
    const f = $("#adminLogin"), er = $(".form-error", f);
    let fails = 0, lockedUntil = 0;
    f.pw.focus();
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (Date.now() < lockedUntil) { er.textContent = `Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)} seconds.`; er.hidden = false; return; }
      let h = "";
      try { h = await sha256("agnipuja-admin:" + f.pw.value); } catch (err) { er.textContent = "Please open the admin page over https (or localhost)."; er.hidden = false; return; }
      if (h === ADMIN_HASH) { A.sWrite("adminOk", h); location.reload(); return; }
      fails++;
      if (fails >= 5) { lockedUntil = Date.now() + 30000; fails = 0; }
      er.textContent = "Incorrect password."; er.hidden = false;
      f.pw.value = ""; f.pw.focus();
    });
    return;
  }

  root.innerHTML = `<div class="dash"><nav class="dash-nav" id="adminNav" aria-label="Admin sections"></nav><div class="dash-main" id="adminMain"></div></div>`;
  const tab = () => (TABS.some((t) => t[0] === location.hash.slice(1)) ? location.hash.slice(1) : "overview");
  const sortAsc = (a, b) => A.istToDate(a.date, a.slot) - A.istToDate(b.date, b.slot);
  const isUpcoming = (b) => b.status === "confirmed" && A.hoursUntil(b.date, b.slot) > -3;
  const net = (b) => b.total - (b.refund || 0);
  const when = (b) => `${A.fmtDay(b.date, b.slot)} · ${A.fmtTime(b.date, b.slot)} IST`;
  const head = (title, text, action = "") => `<div class="dash-head"><div><h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>${action}</div>`;
  const table = (cols, rows, emptyText = "Nothing here yet.") => rows.length
    ? `<div class="table-wrap"><table class="table"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`
    : `<div class="empty"><p>${emptyText}</p></div>`;
  const customerWa = (b, text) => `https://wa.me/${String(b.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

  function nav() {
    const upcoming = A.bookings().filter(isUpcoming).length;
    const ship = A.bookings().filter((b) => b.shipping && ["Awaiting puja", "Packed"].includes(b.shipping.status) && b.status !== "cancelled").length;
    const counts = { bookings: upcoming, shipping: ship };
    $("#adminNav").innerHTML = TABS.map(([k, l, ic]) => `<a href="#${k}" class="${k === tab() ? "active" : ""}">${icon(ic)} ${l}${counts[k] ? `<span class="count">${counts[k]}</span>` : ""}</a>`).join("") +
      `<a href="#" data-act="reset" style="margin-top:8px">${icon("refresh")} Reset demo data</a><a href="#" data-act="exit">${icon("logout")} Log out of admin</a>`;
  }

  /* ---------------- Views ---------------- */
  const V = {};

  V.overview = () => {
    const all = A.bookings(), live = all.filter((b) => b.status !== "cancelled");
    const revenue = all.reduce((s, b) => s + net(b), 0);
    const byPuja = {};
    live.forEach((b) => { byPuja[b.pujaName] = (byPuja[b.pujaName] || 0) + b.total; });
    const top = Object.entries(byPuja).sort((a, b) => b[1] - a[1]);
    const max = top.length ? top[0][1] : 1;
    const online = live.filter((b) => b.mode === "online"), home = live.filter((b) => b.mode === "home");
    const months = {};
    live.forEach((b) => { const k = b.date.slice(0, 7); months[k] = (months[k] || 0) + b.total; });
    const mKeys = Object.keys(months).sort().slice(-6);
    const mMax = Math.max(1, ...mKeys.map((k) => months[k]));
    const up = all.filter(isUpcoming).sort(sortAsc).slice(0, 6);
    return head("Reports", "Bookings and revenue at a glance.") + `
      <div class="kpis">
        <div class="kpi"><span>Bookings</span><strong>${live.length}</strong><small>${all.length - live.length} cancelled</small></div>
        <div class="kpi"><span>Net revenue</span><strong>${money(revenue)}</strong><small>after refunds</small></div>
        <div class="kpi"><span>Upcoming</span><strong>${all.filter(isUpcoming).length}</strong><small>confirmed</small></div>
        <div class="kpi"><span>NRI bookings</span><strong>${live.filter((b) => b.nri).length}</strong><small>${A.users().length} customers</small></div>
      </div>
      <div class="split-2">
        <div class="panel"><h3>Revenue by puja</h3><div class="bar-chart">${top.map(([n, v]) => `<div class="bar-row"><span>${esc(n)}</span><div class="bar"><i style="width:${(v / max) * 100}%"></i></div><span>${money(v)}</span></div>`).join("") || "<p class='muted'>No data</p>"}</div></div>
        <div class="panel"><h3>Revenue by month</h3><div class="bar-chart">${mKeys.map((k) => `<div class="bar-row"><span>${new Date(k + "-01T00:00:00Z").toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</span><div class="bar"><i style="width:${(months[k] / mMax) * 100}%"></i></div><span>${money(months[k])}</span></div>`).join("")}</div>
          <h3 style="margin-top:22px">Booking type</h3>
          <div class="bar-chart">
            <div class="bar-row"><span>${icon("video")} Online</span><div class="bar"><i style="width:${(online.length / Math.max(1, live.length)) * 100}%"></i></div><span>${online.length}</span></div>
            <div class="bar-row"><span>${icon("home")} At home</span><div class="bar"><i style="width:${(home.length / Math.max(1, live.length)) * 100}%"></i></div><span>${home.length}</span></div>
          </div></div>
      </div>
      <h3 style="margin-top:26px">Next bookings</h3>
      ${table(["When", "Puja", "Customer", "Pandit"], up.map((b) => `<tr><td>${when(b)}</td><td><strong>${esc(b.pujaName)}</strong><small>${b.mode === "online" ? "Online" : "At home · " + esc(b.city)}</small></td><td>${esc(b.customerName)}${b.nri ? ` <span class="badge">NRI</span>` : ""}</td><td>${esc((A.pandit(b.panditId) || {}).name || "—")}</td></tr>`), "No upcoming bookings.")}`;
  };

  V.bookings = () => {
    let list = A.bookings().slice().sort((a, b) => sortAsc(b, a));
    if (ui.type === "online" || ui.type === "home") list = list.filter((b) => b.mode === ui.type);
    if (ui.type === "nri") list = list.filter((b) => b.nri);
    if (ui.status === "upcoming") list = list.filter(isUpcoming);
    else if (ui.status !== "all") list = list.filter((b) => b.status === ui.status);
    const q = ui.q.toLowerCase();
    if (q) list = list.filter((b) => [b.id, b.customerName, b.pujaName, b.city, b.phone, b.email].join(" ").toLowerCase().includes(q));
    const rows = list.map((b) => {
      const slot = A.availability({ date: b.date, mode: b.mode, city: b.city, ignoreId: b.id }).find((s) => s.slot === b.slot);
      const opts = A.pandits().filter((p) => p.id === b.panditId || (slot && slot.pandits.some((x) => x.id === p.id)));
      const editable = b.status === "confirmed";
      return `<tr>
        <td><strong>${b.id}</strong><small>${when(b)}</small></td>
        <td>${esc(b.customerName)}<small>${esc(b.phone)}</small>${b.nri ? `<span class="badge">${icon("globe")} ${esc((A.country(b.countryCode) || {}).name)}</span>` : ""}</td>
        <td><strong>${esc(b.pujaName)}</strong><small>${b.mode === "online" ? "Online" : "At home · " + esc(b.city)}</small></td>
        <td>${editable ? `<select class="input" data-act="assign" data-id="${b.id}" aria-label="Assign Pandit">${opts.map((p) => `<option value="${p.id}"${p.id === b.panditId ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</select>` : esc((A.pandit(b.panditId) || {}).name || "—")}</td>
        <td>${U.statusBadge(b.status)}</td>
        <td>${money(b.total)}${b.refund ? `<small>refund ${money(b.refund)}</small>` : ""}</td>
        <td><div class="row-actions">
          <button class="icon-btn" title="View details" aria-label="View details" data-act="view" data-id="${b.id}">${icon("info")}</button>
          ${b.mode === "online" && editable ? `<button class="icon-btn" title="Meeting link" aria-label="Edit meeting link" data-act="link" data-id="${b.id}">${icon("video")}</button>` : ""}
          ${editable ? `<button class="icon-btn" title="Mark completed" aria-label="Mark completed" data-act="complete" data-id="${b.id}">${icon("check")}</button>
          <button class="icon-btn" title="Send reminder" aria-label="Send reminder" data-act="remind" data-id="${b.id}">${icon("bell")}</button>
          <button class="icon-btn" title="Cancel & refund" aria-label="Cancel and refund" data-act="cancel" data-id="${b.id}">${icon("close")}</button>` : ""}
        </div></td></tr>`;
    });
    return head("Bookings", "Assign Pandits, share meeting links, complete or cancel bookings.") + `
      <div class="toolbar">
        <input class="input" type="search" placeholder="Search ID, name, puja, city…" value="${esc(ui.q)}" data-ui="q" aria-label="Search bookings">
        <select class="input" data-ui="type" aria-label="Booking type">${[["all", "All types"], ["online", "Online"], ["home", "At home"], ["nri", "NRI only"]].map(([k, l]) => `<option value="${k}"${ui.type === k ? " selected" : ""}>${l}</option>`).join("")}</select>
        <select class="input" data-ui="status" aria-label="Status">${[["all", "All statuses"], ["upcoming", "Upcoming"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([k, l]) => `<option value="${k}"${ui.status === k ? " selected" : ""}>${l}</option>`).join("")}</select>
        <span class="muted">${list.length} bookings</span>
      </div>` + table(["Booking", "Customer", "Puja", "Pandit", "Status", "Amount", "Actions"], rows, "No bookings match.");
  };

  V.pandits = () => {
    const list = A.pandits(), bk = A.bookings().filter(isUpcoming);
    return head("Pandits", "Pandit availability decides which time slots customers can book.", `<button class="btn btn-primary" data-act="addPandit">${icon("plus")} Add Pandit</button>`) +
      table(["Pandit", "Serves", "Weekly days off", "Blocked dates", "Upcoming", "Active"], list.map((p) => `<tr>
        <td><strong>${esc(p.name)}</strong><small>${p.experience} yrs · ${esc(p.languages.join(", "))}</small></td>
        <td>${p.modes.map(U.modeBadge).join(" ")}<small>${esc(p.cities.join(", ") || "Online only")}</small></td>
        <td><div class="days">${DAYS.map((d, i) => `<label><input type="checkbox" data-act="off" data-id="${p.id}" data-day="${i}" ${(p.weeklyOff || []).includes(i) ? "checked" : ""}><span>${d}</span></label>`).join("")}</div></td>
        <td>${(p.blocked || []).map((d) => `<span class="badge badge-red" style="margin:0 4px 4px 0">${A.fmtDay(d)} <button class="link-btn" data-act="unblock" data-id="${p.id}" data-date="${d}" aria-label="Unblock ${d}">×</button></span>`).join("")}
          <input type="date" class="input" style="width:150px;margin-top:4px" min="${A.istToday()}" data-act="block" data-id="${p.id}" aria-label="Block a date"></td>
        <td>${bk.filter((b) => b.panditId === p.id).length}</td>
        <td><label class="check"><input type="checkbox" data-act="active" data-id="${p.id}" ${p.active ? "checked" : ""}><span>${p.active ? "Active" : "Off"}</span></label></td></tr>`));
  };

  V.cities = () => {
    const pd = A.pandits();
    return head("Locations", "Cities where Pandits visit homes, and the travel charge for each.", `<button class="btn btn-primary" data-act="addCity">${icon("plus")} Add city</button>`) +
      table(["City", "State", "Travel charge (₹)", "Pandits", "Serviceable", ""], A.cities().map((c, i) => `<tr>
        <td><strong>${esc(c.name)}</strong></td><td>${esc(c.state)}</td>
        <td><input class="input" type="number" min="0" step="50" style="width:110px" value="${c.travel}" data-act="travel" data-i="${i}" aria-label="Travel charge for ${esc(c.name)}"></td>
        <td>${pd.filter((p) => p.active && p.cities.includes(c.name)).length}</td>
        <td><label class="check"><input type="checkbox" data-act="cityActive" data-i="${i}" ${c.active ? "checked" : ""}><span>${c.active ? "Yes" : "Paused"}</span></label></td>
        <td><button class="icon-btn" data-act="delCity" data-i="${i}" aria-label="Remove ${esc(c.name)}">${icon("trash")}</button></td></tr>`)) +
      `<p class="hint" style="margin-top:12px">${icon("info")} A city needs at least one active Pandit serving it before customers can book home visits there.</p>`;
  };

  V.pujas = () => head("Puja Services", "Prices, booking types and visibility. Changes show on the website straight away.", `<button class="btn btn-primary" data-act="addPuja">${icon("plus")} Add puja</button>`) +
    table(["Puja", "Featured", "Online ₹", "At home ₹", "Samagri ₹", "Shown on site"], A.pujas(true).map((p) => `<tr>
      <td><strong>${esc(p.name)}</strong><small>${esc(p.type)} · ${esc(p.duration)}</small></td>
      <td><input type="checkbox" class="check" data-act="pfeat" data-id="${esc(p.id)}" ${p.featured ? "checked" : ""} aria-label="Featured"></td>
      ${["online", "home"].map((m) => `<td><label class="check" style="margin-bottom:4px"><input type="checkbox" data-act="pmode" data-mode="${m}" data-id="${esc(p.id)}" ${p.modes.includes(m) ? "checked" : ""}><span>Offer</span></label>
        <input class="input" type="number" min="0" step="100" style="width:100px" value="${(p.price || {})[m] || ""}" data-act="pprice" data-mode="${m}" data-id="${esc(p.id)}" aria-label="${m} price" ${p.modes.includes(m) ? "" : "disabled"}></td>`).join("")}
      <td><input class="input" type="number" min="0" step="100" style="width:100px" value="${p.samagri || 0}" data-act="psam" data-id="${esc(p.id)}" aria-label="Samagri price"></td>
      <td><label class="check"><input type="checkbox" data-act="pshow" data-id="${esc(p.id)}" ${p.removed ? "" : "checked"}><span>${p.removed ? "Removed" : "Shown"}</span></label></td></tr>`));

  V.customers = () => {
    const all = A.bookings();
    const q = ui.q.toLowerCase();
    const list = A.users().filter((u) => !q || [u.name, u.email, u.phone].join(" ").toLowerCase().includes(q));
    return head("Customers", `${A.users().length} registered customers.`) +
      `<div class="toolbar"><input class="input" type="search" placeholder="Search name, email, phone…" value="${esc(ui.q)}" data-ui="q" aria-label="Search customers"></div>` +
      table(["Customer", "Contact", "Location", "Signed in with", "Bookings", "Spent"], list.map((u) => {
        const mine = all.filter((b) => b.userId === u.id);
        const co = A.country((u.address || {}).country);
        return `<tr><td><strong>${esc(u.name || "—")}</strong><small>Joined ${new Date(u.createdAt).toLocaleDateString("en-GB")}</small></td>
          <td>${esc(u.email || "—")}<small>${esc(u.phone || "")}</small></td>
          <td>${esc((u.address || {}).city || "—")}<small>${esc(co ? co.name : "")}</small>${co && co.code !== "IN" ? ` <span class="badge">NRI</span>` : ""}</td>
          <td>${esc({ google: "Google", phone: "Mobile OTP", email: "Email" }[u.provider] || u.provider)}</td>
          <td>${mine.length}</td><td>${money(mine.reduce((s, b) => s + net(b), 0))}</td></tr>`;
      }), "No customers found.");
  };

  V.payments = () => {
    const list = A.bookings().slice().sort((a, b) => new Date(b.payment.paidAt) - new Date(a.payment.paidAt));
    const gross = list.reduce((s, b) => s + b.total, 0), refunds = list.reduce((s, b) => s + (b.refund || 0), 0);
    return head("Payments", "All payments in INR.") + `
      <div class="kpis" style="grid-template-columns:repeat(3,1fr)">
        <div class="kpi"><span>Collected</span><strong>${money(gross)}</strong></div>
        <div class="kpi"><span>Refunded</span><strong>${money(refunds)}</strong></div>
        <div class="kpi"><span>Net</span><strong>${money(gross - refunds)}</strong></div>
      </div>` +
      table(["Date", "Transaction", "Customer", "Method", "Amount", "Status"], list.map((b) => `<tr>
        <td>${new Date(b.payment.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
        <td><strong>${esc(b.payment.txnId)}</strong><small>${b.id} · ${esc(b.pujaName)}</small></td>
        <td>${esc(b.customerName)}${b.nri ? ` <span class="badge">NRI</span>` : ""}</td>
        <td>${esc(b.payment.method)}</td>
        <td>${money(b.total)}${b.refund ? `<small>refund ${money(b.refund)}</small>` : ""}</td>
        <td><span class="badge ${b.payment.status === "paid" ? "badge-green" : "badge-gold"}">${esc(b.payment.status)}</span></td></tr>`));
  };

  V.shipping = () => {
    const list = A.bookings().filter((b) => b.shipping).sort(sortAsc);
    return head("Prasadam Shipping", "Update the status as Prasadam is packed and shipped. Customers see it in their dashboard.") +
      table(["Booking", "Ship to", "Status", "Carrier & tracking", ""], list.map((b) => `<tr>
        <td><strong>${b.id}</strong><small>${esc(b.pujaName)} · ${A.fmtDay(b.date)}</small></td>
        <td>${esc(b.customerName)}<small>${esc(A.fmtAddress(b.address))}</small></td>
        <td><select class="input" data-ship="status" data-id="${b.id}" ${b.status === "cancelled" ? "disabled" : ""}>${SHIP.map((s) => `<option${s === b.shipping.status ? " selected" : ""}>${s}</option>`).join("")}</select></td>
        <td><input class="input" placeholder="Carrier" value="${esc(b.shipping.carrier)}" data-ship="carrier" data-id="${b.id}" style="margin-bottom:4px">
          <input class="input" placeholder="Tracking no." value="${esc(b.shipping.tracking)}" data-ship="tracking" data-id="${b.id}"></td>
        <td><button class="btn btn-soft btn-sm" data-act="saveShip" data-id="${b.id}" ${b.status === "cancelled" ? "disabled" : ""}>Save</button></td></tr>`), "No Prasadam shipments.");
  };

  V.notify = () => {
    const log = [];
    A.bookings().forEach((b) => (b.notifications || []).forEach((n) => log.push(Object.assign({ id: b.id, name: b.customerName }, n))));
    log.sort((a, b) => new Date(b.at) - new Date(a.at));
    const up = A.bookings().filter(isUpcoming).sort(sortAsc);
    return head("Notifications", "Booking messages sent to customers by SMS, email and WhatsApp.") + `
      <div class="panel" style="margin-bottom:20px"><h3>Send a reminder</h3>
        <div class="toolbar" style="margin:0">
          <select class="input" id="remindPick" style="max-width:none;flex:1">${up.map((b) => `<option value="${b.id}">${b.id} · ${esc(b.pujaName)} · ${esc(b.customerName)} · ${when(b)}</option>`).join("")}</select>
          <button class="btn btn-primary" data-act="remindPick" ${up.length ? "" : "disabled"}>${icon("bell")} Send reminder</button>
        </div>
        <p class="hint" style="margin-top:10px">${icon("info")} Prototype: messages are logged here. WhatsApp also opens a ready-to-send chat with the customer.</p>
      </div>` +
      table(["Sent", "Booking", "Channel", "To", "Message"], log.slice(0, 80).map((n) => `<tr>
        <td>${new Date(n.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
        <td><strong>${n.id}</strong><small>${esc(n.name)}</small></td>
        <td><span class="badge">${esc(n.channel)}</span></td><td>${esc(n.to)}</td><td>${esc(n.text)}</td></tr>`), "No notifications yet.");
  };

  /* ---------------- Actions ---------------- */
  function updPandit(id, fn) { const list = A.pandits(); const p = list.find((x) => x.id === id); fn(p); A.savePandits(list); }
  function updCity(i, fn) { const list = A.cities(); fn(list[i], list); A.saveCities(list); }

  function remind(id) {
    const b = A.updateBooking(id, (x) => A.notify(x, "reminder"));
    const text = b.notifications[b.notifications.length - 1].text;
    U.toast(`Reminder for ${b.id} logged for SMS, email and WhatsApp.`);
    window.open(customerWa(b, `Namaste ${b.customerName}, ${text}`), "_blank", "noopener");
    render();
  }

  function viewBooking(id) {
    const b = A.booking(id), pd = A.pandit(b.panditId) || {};
    U.modal(`<h3>${b.id} · ${esc(b.pujaName)}</h3>
      <p class="modal-intro">${U.modeBadge(b.mode)} ${U.statusBadge(b.status)}</p>
      <div class="review-grid">
        <div class="review-box"><h4>When</h4><p>${when(b)}${b.tz !== "Asia/Kolkata" ? `<br>${A.fmtTime(b.date, b.slot, b.tz)} customer time (${esc(b.tz)})` : ""}</p></div>
        <div class="review-box"><h4>Customer</h4><p>${esc(b.customerName)}<br>${esc(b.phone)}<br>${esc(b.email)}</p></div>
        <div class="review-box"><h4>${b.mode === "home" ? "Puja address" : "Ship to"}</h4><p>${esc(A.fmtAddress(b.address) || "—")}</p></div>
        <div class="review-box"><h4>Pandit</h4><p>${esc(pd.name || "—")}${b.language ? `<br>Language: ${esc(b.language)}` : ""}</p></div>
        <div class="review-box" style="grid-column:1/-1"><h4>Puja details</h4><p>${Object.entries(b.details || {}).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join("<br>") || "—"}${b.instructions ? `<br>Instructions: ${esc(b.instructions)}` : ""}</p></div>
        <div class="review-box" style="grid-column:1/-1"><h4>Price</h4><p>${b.lines.map((l) => `${esc(l.label)}: ${money(l.amount)}`).join("<br>")}<br><strong>Total ${money(b.total)}</strong> · ${esc(b.payment.method)} · ${esc(b.payment.txnId)}</p></div>
        <div class="review-box" style="grid-column:1/-1"><h4>History</h4><p>${b.history.map((h) => `${new Date(h.at).toLocaleString("en-GB")}: ${esc(h.text)}`).join("<br>")}</p></div>
      </div>
      <div class="form-actions">
        <a class="btn btn-whatsapp" href="${customerWa(b, `Namaste ${b.customerName}, regarding your booking ${b.id} (${b.pujaName}).`)}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp customer</a>
        <a class="btn btn-outline" href="mailto:${esc(b.email)}?subject=${encodeURIComponent("Your booking " + b.id)}">${icon("mail")} Email</a>
      </div>`, { wide: true });
  }

  function linkBox(id) {
    const b = A.booking(id);
    const m = U.modal(`<h3>Meeting link for ${b.id}</h3>
      <p class="modal-intro">A Jitsi link is created automatically. Paste a Zoom or Google Meet link here to replace it.</p>
      <form class="form"><label class="field">Meeting link<input name="link" type="url" value="${esc(b.meetingLink)}" required></label>
      <label class="check"><input type="checkbox" name="send" checked><span>Send the link to the customer (SMS, email, WhatsApp)</span></label>
      <p class="form-error" hidden></p><button class="btn btn-primary" type="submit">Save link</button></form>`);
    const f = $("form", m.el);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!/^https:\/\/\S+$/.test(f.link.value.trim())) { const er = $(".form-error", f); er.textContent = "Please enter a full https:// link."; er.hidden = false; return; }
      A.updateBooking(id, (x) => { x.meetingLink = f.link.value.trim(); x.history.push({ at: new Date().toISOString(), text: "Meeting link updated" }); if (f.send.checked) A.notify(x, "reminder"); });
      m.close(); U.toast("Meeting link saved."); render();
    });
  }

  function formBox(title, fields, onSave) {
    const m = U.modal(`<h3>${title}</h3><form class="form" novalidate>${fields}<p class="form-error" hidden></p><button class="btn btn-primary" type="submit">Save</button></form>`, { wide: true });
    const f = $("form", m.el);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      let bad = false;
      $$("[required]", f).forEach((el) => { const x = !el.value.trim(); el.classList.toggle("invalid", x); bad = bad || x; });
      const er = $(".form-error", f);
      if (bad) { er.textContent = "Please fill in the required fields."; er.hidden = false; return; }
      try { onSave(f); m.close(); render(); } catch (err) { er.textContent = err.message; er.hidden = false; }
    });
  }
  const multi = (name, opts, checked = []) => `<div class="days">${opts.map((o) => `<label><input type="checkbox" name="${name}" value="${esc(o)}" ${checked.includes(o) ? "checked" : ""}><span style="padding:0 10px">${esc(o)}</span></label>`).join("")}</div>`;
  const picked = (f, name) => $$(`input[name="${name}"]:checked`, f).map((x) => x.value);

  document.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-act]");
    if (!t || !document.getElementById("adminRoot").contains(t)) return;
    const act = t.dataset.act, id = t.dataset.id;
    if (t.tagName === "SELECT" || t.tagName === "INPUT") return;
    e.preventDefault();
    if (act === "exit") { A.sWrite("adminOk", null); location.href = "index.html"; }
    else if (act === "reset") {
      if (await U.confirmBox("Reset demo data?", "This deletes all accounts, bookings and admin changes saved in this browser and restores the sample data.", "Reset", true)) { A.resetDemo(); U.toast("Demo data reset."); render(); }
    }
    else if (act === "view") viewBooking(id);
    else if (act === "link") linkBox(id);
    else if (act === "remind") remind(id);
    else if (act === "remindPick") remind($("#remindPick").value);
    else if (act === "complete") {
      A.updateBooking(id, (b) => { b.status = "completed"; b.history.push({ at: new Date().toISOString(), text: "Marked completed" }); if (b.shipping && b.shipping.status === "Awaiting puja") b.shipping.status = "Packed"; });
      U.toast(`${id} marked completed.`); render();
    }
    else if (act === "cancel") {
      const b = A.booking(id);
      if (await U.confirmBox(`Cancel ${id}?`, `${esc(b.pujaName)} for ${esc(b.customerName)}. The customer gets a full refund of ${money(b.total)} and is notified.`, "Cancel & refund", true)) {
        A.cancel(id, "", true); U.toast(`${id} cancelled and refunded.`); render();
      }
    }
    else if (act === "unblock") { updPandit(id, (p) => (p.blocked = p.blocked.filter((d) => d !== t.dataset.date))); render(); }
    else if (act === "delCity") {
      const c = A.cities()[+t.dataset.i];
      if (await U.confirmBox(`Remove ${c.name}?`, "Customers will no longer be able to book home visits in this city. Existing bookings are kept.", "Remove", true)) { updCity(+t.dataset.i, (_, list) => list.splice(+t.dataset.i, 1)); render(); }
    }
    else if (act === "saveShip") {
      const g = (k) => $(`[data-ship="${k}"][data-id="${id}"]`).value.trim();
      const before = A.booking(id).shipping.status;
      A.updateBooking(id, (b) => {
        Object.assign(b.shipping, { status: g("status"), carrier: g("carrier"), tracking: g("tracking"), updatedAt: new Date().toISOString() });
        if (b.shipping.status === "Shipped" && before !== "Shipped") A.notify(b, "shipped");
      });
      U.toast("Shipping updated."); render();
    }
    else if (act === "addPandit") {
      formBox("Add a Pandit", `
        <div class="form-row"><label class="field">Name <span class="req">*</span><input name="name" required></label>
        <label class="field">Years of experience <span class="req">*</span><input name="exp" type="number" min="0" required></label></div>
        <div class="field">Languages${multi("lang", A.DATA.booking.languages)}</div>
        <div class="field">Booking types${multi("mode", ["online", "home"], ["online", "home"])}</div>
        <div class="field">Cities for home visits${multi("city", A.cities().map((c) => c.name))}</div>`, (f) => {
        const modes = picked(f, "mode");
        if (!modes.length) throw new Error("Choose at least one booking type.");
        const list = A.pandits();
        list.push({ id: "pd" + Date.now().toString(36), name: f.name.value.trim(), experience: +f.exp.value, languages: picked(f, "lang"), modes, cities: picked(f, "city"), weeklyOff: [], blocked: [], active: true });
        A.savePandits(list);
        U.toast("Pandit added.");
      });
    }
    else if (act === "addCity") {
      formBox("Add a city", `
        <div class="form-row-3"><label class="field">City <span class="req">*</span><input name="name" required></label>
        <label class="field">State <span class="req">*</span><input name="state" required></label>
        <label class="field">Travel charge (₹)<input name="travel" type="number" min="0" value="0"></label></div>`, (f) => {
        const name = f.name.value.trim();
        if (A.city(name)) throw new Error("This city already exists.");
        const list = A.cities();
        list.push({ name, state: f.state.value.trim(), travel: +f.travel.value || 0, active: true });
        A.saveCities(list);
        U.toast(`${name} added. Assign Pandits to it on the Pandits tab.`);
      });
    }
    else if (act === "addPuja") {
      formBox("Add a puja service", `
        <div class="form-row"><label class="field">Name <span class="req">*</span><input name="name" required></label>
        <label class="field">Type<select name="type"><option value="homam">Homam</option><option value="pooja">Pooja</option><option value="ceremony">Ceremony</option></select></label></div>
        <label class="field">Short description <span class="req">*</span><input name="short" required></label>
        <label class="field">Full description<textarea name="description" rows="3"></textarea></label>
        <div class="form-row-3"><label class="field">Online price (₹)<input name="online" type="number" min="0"></label>
        <label class="field">At-home price (₹)<input name="home" type="number" min="0"></label>
        <label class="field">Samagri kit (₹)<input name="samagri" type="number" min="0"></label></div>
        <div class="form-row"><label class="field">Duration<input name="duration" placeholder="e.g. 2 – 3 hours"></label>
        <label class="field">Ideal for<input name="idealFor"></label></div>
        <label class="field">Photo path or link<input name="image" placeholder="images/your-photo.jpg"></label>`, (f) => {
        const g = (k) => f[k].value.trim();
        const price = {};
        if (+g("online") > 0) price.online = +g("online");
        if (+g("home") > 0) price.home = +g("home");
        if (!Object.keys(price).length) throw new Error("Enter an online and/or at-home price.");
        const idBase = g("name").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (A.puja(idBase)) throw new Error("A puja with this name already exists.");
        A.addPuja({
          id: idBase, name: g("name"), type: g("type"), popular: false, featured: false, image: g("image"),
          short: g("short"), description: g("description") || g("short"), benefits: [], duration: g("duration") || "Varies",
          idealFor: g("idealFor") || "—", price, samagri: +g("samagri") || 0, modes: Object.keys(price), fields: ["sankalpa"]
        });
        U.toast("Puja added to the website.");
      });
    }
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!document.getElementById("adminRoot").contains(t)) return;
    if (t.dataset.ui) { ui[t.dataset.ui] = t.value; render(); return; }
    const act = t.dataset.act, id = t.dataset.id;
    if (act === "assign") {
      A.updateBooking(id, (b) => { b.panditId = t.value; b.history.push({ at: new Date().toISOString(), text: "Pandit assigned: " + (A.pandit(t.value) || {}).name }); });
      U.toast("Pandit assigned.");
    }
    else if (act === "off") { updPandit(id, (p) => { const d = +t.dataset.day; p.weeklyOff = t.checked ? (p.weeklyOff || []).concat(d) : p.weeklyOff.filter((x) => x !== d); }); }
    else if (act === "block" && t.value) { updPandit(id, (p) => { if (!(p.blocked || []).includes(t.value)) p.blocked = (p.blocked || []).concat(t.value).sort(); }); render(); }
    else if (act === "active") { updPandit(id, (p) => (p.active = t.checked)); render(); }
    else if (act === "travel") { updCity(+t.dataset.i, (c) => (c.travel = Math.max(0, +t.value || 0))); U.toast("Travel charge saved."); }
    else if (act === "cityActive") { updCity(+t.dataset.i, (c) => (c.active = t.checked)); render(); }
    else if (act === "pfeat") { A.editPuja(id, { featured: t.checked }); }
    else if (act === "pmode") {
      const p = A.puja(id);
      const modes = t.checked ? p.modes.concat(t.dataset.mode) : p.modes.filter((m) => m !== t.dataset.mode);
      if (!modes.length) { t.checked = true; U.toast("A puja needs at least one booking type.", "error"); return; }
      const price = Object.assign({}, p.price);
      if (t.checked && !price[t.dataset.mode]) price[t.dataset.mode] = 2100;
      A.editPuja(id, { modes, price }); render();
    }
    else if (act === "pprice") { const p = A.puja(id); A.editPuja(id, { price: Object.assign({}, p.price, { [t.dataset.mode]: Math.max(0, +t.value || 0) }) }); U.toast("Price saved."); }
    else if (act === "psam") { A.editPuja(id, { samagri: Math.max(0, +t.value || 0) }); U.toast("Samagri price saved."); }
    else if (act === "pshow") { A.editPuja(id, { removed: !t.checked }); render(); }
  });

  // Search box: filter as you type without losing focus
  document.addEventListener("input", (e) => {
    if (e.target.dataset && e.target.dataset.ui === "q") {
      ui.q = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const box = $('[data-ui="q"]');
      if (box) { box.focus(); box.setSelectionRange(pos, pos); }
    }
  });

  function render() { nav(); $("#adminMain").innerHTML = V[tab()](); }
  window.addEventListener("hashchange", () => { ui.q = ""; render(); });
  render();
})();
