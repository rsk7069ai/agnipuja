/* Agni Puja – booking journey
   1 Type → 2 Puja → 3 Details (login needed) → 4 Date & slot → 5 Review & pay → 6 Confirmed */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI;
  const { $, $$, esc, icon, money } = U;
  const B = A.DATA.booking;

  /* ---------------- State (kept for the tab, survives the login detour) ---------------- */
  const fresh = () => ({ step: 1, mode: "", pujaId: "", countryCode: "", tz: "", city: "", addrId: "", newAddr: {}, samagri: true, prasadam: true, language: "", details: {}, instructions: "", name: "", phone: "", email: "", date: "", slot: "", pay: "" });
  let S = U.qs("resume") ? Object.assign(fresh(), A.sRead("wizard", {})) : fresh();
  if (!U.qs("resume")) {
    const mode = U.qs("mode"), pid = U.qs("puja"), co = U.qs("country");
    const p = pid && A.puja(pid);
    if (mode === "online" || mode === "home") S.mode = mode;
    if (p && !p.removed) {
      S.pujaId = p.id;
      if (!S.mode && p.modes.length === 1) S.mode = p.modes[0];
      if (S.mode && !p.modes.includes(S.mode)) S.pujaId = "";
    }
    if (co && A.country(co)) { S.countryCode = co; S.mode = S.mode || "online"; }
    S.step = S.mode && S.pujaId ? 3 : S.mode ? 2 : 1;
  }
  const save = () => A.sWrite("wizard", S);
  const puja = () => A.puja(S.pujaId);
  const country = () => A.country(S.countryCode || "IN") || A.country("IN");
  const tz = () => (S.mode === "online" ? S.tz || country().zones[0][0] : "Asia/Kolkata");

  function go(step) {
    S.step = step;
    save();
    render();
    const top = $("#stepper").getBoundingClientRect().top + window.scrollY - 100;
    if (window.scrollY > top || step === 6) window.scrollTo({ top, behavior: "smooth" });
  }

  /* ---------------- Summary sidebar ---------------- */
  function renderSummary() {
    const p = puja();
    const box = $("#summary");
    if (S.step >= 6 || (!p && !S.mode)) { box.innerHTML = ""; box.hidden = true; return; }
    box.hidden = false;
    const q = p && S.mode ? A.quote(quoteInput()) : null;
    box.innerHTML = `<div class="panel">
      <h3>Your Booking</h3>
      ${p ? `<div class="summary-puja">${U.media(p)}<div><strong>${esc(p.name)}</strong>${S.mode ? U.modeBadge(S.mode) : ""}</div></div>` : S.mode ? `<p>${U.modeBadge(S.mode)}</p>` : ""}
      <ul class="kv">
        ${S.date && S.slot ? `<li>${icon("calendar")}<span>${A.fmtDay(S.date, S.slot, tz(), true)}<br><strong>${A.fmtTime(S.date, S.slot, tz())}</strong>${tz() !== "Asia/Kolkata" ? ` your time · ${A.fmtTime(S.date, S.slot)} IST` : " IST"}</span></li>` : ""}
        ${S.mode === "home" && S.city ? `<li>${icon("pin")}<span>${esc(S.city)}</span></li>` : ""}
        ${S.mode === "online" && S.step >= 3 ? `<li>${icon("globe")}<span>${esc(country().name)}</span></li>` : ""}
      </ul>
      ${q ? `<table class="price-table">${q.lines.map((l) => `<tr><td>${esc(l.label)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</td><td>${money(l.amount)}</td></tr>`).join("")}
        <tr class="total"><td>Total</td><td>${money(q.total)}</td></tr></table>
        ${country().code !== "IN" ? `<p class="price-approx">${U.approx(q.total, country().code)}</p>` : ""}` : ""}
    </div>`;
  }

  function quoteInput() {
    return { pujaId: S.pujaId, mode: S.mode, city: S.city, samagri: S.samagri, prasadam: S.prasadam && country().prasadam.available, countryCode: country().code };
  }

  function renderStepper() {
    $$("#stepper li").forEach((li, i) => {
      li.className = i + 1 < S.step ? "done" : i + 1 === S.step ? "current" : "";
      if (i + 1 === S.step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
  }

  /* ---------------- Step 1: booking type ---------------- */
  function step1() {
    const p = puja();
    const allowed = (m) => !p || p.modes.includes(m);
    return `<div class="panel">
      <h2>How would you like your puja performed?</h2>
      <p class="panel-intro">You can browse without logging in. We'll ask you to log in before confirming.</p>
      <div class="choice-grid">
        <button type="button" class="choice${S.mode === "online" ? " selected" : ""}" data-mode="online" ${allowed("online") ? "" : "disabled"}>
          <span class="feature-icon">${icon("video")}</span>
          <strong>Online Puja</strong>
          <p>Pandit performs the puja live on video. Join from anywhere – ideal for NRIs.</p>
          <ul class="tick-list"><li>${icon("check")} Live video link</li><li>${icon("check")} Slots in your time zone</li><li>${icon("check")} Prasadam shipped to you</li></ul>
          ${allowed("online") ? "" : `<p><em>Not available for ${esc(p.name)}</em></p>`}
        </button>
        <button type="button" class="choice${S.mode === "home" ? " selected" : ""}" data-mode="home" ${allowed("home") ? "" : "disabled"}>
          <span class="feature-icon">${icon("home")}</span>
          <strong>Pandit at Home</strong>
          <p>A qualified Pandit visits your home or venue and performs the puja in person.</p>
          <ul class="tick-list"><li>${icon("check")} ${A.activeCities().length} cities in India</li><li>${icon("check")} Samagri kit available</li><li>${icon("check")} Pandit details shared</li></ul>
          ${allowed("home") ? "" : `<p><em>Not available for ${esc(p.name)}</em></p>`}
        </button>
      </div>
      <p class="hint" style="margin-top:16px">${icon("globe")} Living outside India? <a class="link-btn" href="nri.html">See NRI Online Puja</a></p>
      <div class="wizard-nav"><button class="btn btn-primary btn-lg" data-next ${S.mode ? "" : "disabled"}>Continue ${icon("arrow")}</button></div>
    </div>`;
  }
  function bind1() {
    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      S.mode = b.dataset.mode;
      const p = puja();
      if (p && !p.modes.includes(S.mode)) S.pujaId = "";
      S.date = S.slot = "";
      save(); render();
    }));
    $("[data-next]").addEventListener("click", () => go(S.pujaId ? 3 : 2));
  }

  /* ---------------- Step 2: puja ---------------- */
  let filter = "all";
  function step2() {
    const list = A.pujas().filter((p) => p.modes.includes(S.mode));
    const shown = list.filter((p) => filter === "all" || (filter === "featured" ? p.featured : p.type === filter));
    return `<div class="panel">
      <h2>Select your puja</h2>
      <p class="panel-intro">${S.mode === "online" ? "Pujas available as a live online puja." : "Pujas our Pandits perform at your home."} Prices include the Pandit's dakshina.</p>
      <div class="filters" style="margin:0 0 18px;justify-content:flex-start">
        ${[["all", "All"], ["featured", "Featured"], ["homam", "Homams"], ["pooja", "Poojas"], ["ceremony", "Ceremonies"]]
          .map(([k, l]) => `<button type="button" class="chip${filter === k ? " active" : ""}" data-filter="${k}">${l}</button>`).join("")}
      </div>
      <div class="pick-grid">
        ${shown.map((p) => `<button type="button" class="pick${p.id === S.pujaId ? " selected" : ""}" data-puja="${esc(p.id)}" aria-pressed="${p.id === S.pujaId}">
          ${p.featured ? `<span class="ribbon">Featured</span>` : ""}${U.media(p)}
          <span class="pick-body"><strong>${esc(p.name)}</strong><span>${esc(p.duration)}</span><span><b>${money(p.price[S.mode])}</b></span></span>
        </button>`).join("") || `<p class="muted">No pujas in this category.</p>`}
      </div>
      <div class="wizard-nav">
        <button class="btn btn-outline" data-back>${icon("back")} Back</button>
        <button class="btn btn-primary btn-lg" data-next ${S.pujaId ? "" : "disabled"}>Continue ${icon("arrow")}</button>
      </div>
    </div>`;
  }
  function bind2() {
    $$("[data-filter]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.filter; render(); }));
    $$("[data-puja]").forEach((b) => b.addEventListener("click", () => { S.pujaId = b.dataset.puja; save(); render(); }));
    $("[data-back]").addEventListener("click", () => go(1));
    $("[data-next]").addEventListener("click", () => go(3));
  }

  /* ---------------- Step 3: details (login required) ---------------- */
  const FIELDSETS = {
    sankalpa: { title: "Sankalpam details", hint: "The Pandit uses these in the sankalpam. Leave blank if you are not sure.", fields: [
      ["gothram", "Gothram"], ["nakshatram", "Nakshatram (birth star)"], ["rasi", "Rasi"], ["names", "Family member names for sankalpam", "textarea"]] },
    departed: { title: "Details of the departed", hint: "Needed for the Pitru rituals. If you don't know this year's thithi date, our Pandit will calculate it from the date of passing.", fields: [
      ["departedName", "Name of the departed", "text", true], ["relationship", "Your relationship (e.g. father)", "text", true], ["dateOfPassing", "Date of passing (if known)", "date"], ["gothram", "Gothram"]] },
    vatu: { title: "Details of the boy (vatu)", hint: "", fields: [
      ["vatuName", "Boy's name", "text", true], ["vatuAge", "Age", "number", true], ["fatherName", "Father's name", "text", true]] }
  };

  function loginGate() {
    const next = "book.html?resume=1";
    return `<div class="panel" style="text-align:center">
      <span class="feature-icon">${icon("lock")}</span>
      <h2>Please log in to continue</h2>
      <p class="panel-intro">Log in or create an account to book. Your details are saved, so you won't need to type them again next time.</p>
      <div class="cta-buttons" style="justify-content:center">
        <a class="btn btn-primary btn-lg" href="login.html?next=${encodeURIComponent(next)}">Log in or sign up</a>
      </div>
      <p class="hint" style="justify-content:center;margin-top:14px">Google, mobile OTP or email</p>
      <div class="wizard-nav"><button class="btn btn-outline" data-back>${icon("back")} Back</button></div>
    </div>`;
  }

  function addrOptions(u) {
    let list = A.allAddresses(u);
    if (S.mode === "home") list = list.filter((a) => a.country === "IN" && a.city === S.city);
    return list;
  }

  function step3() {
    const u = A.currentUser();
    if (!u) return loginGate();
    const p = puja();
    // Defaults from the profile
    S.name = S.name || u.name; S.phone = S.phone || u.phone; S.email = S.email || u.email;
    const prof = u.address || {};
    if (!S.countryCode) S.countryCode = prof.country || "IN";
    if (S.mode === "home" && !S.city) S.city = A.activeCities().some((c) => c.name === prof.city) ? prof.city : "";
    const co = country();
    if (S.mode === "online" && !co.zones.some((z) => z[0] === S.tz)) S.tz = co.zones[0][0];
    const addrs = addrOptions(u);
    if (!addrs.some((a) => a.id === S.addrId)) S.addrId = addrs[0] ? addrs[0].id : "new";
    const homeOutside = S.mode === "home" && prof.country && prof.country !== "IN" && !S.city;
    const cityKnownNotServed = S.mode === "home" && prof.city && prof.country === "IN" && !A.city(prof.city);

    const na = S.newAddr || {};
    const newAddrFields = `
      <div class="form-row"><label class="field">Address line 1 <span class="req">*</span><input name="a_line1" value="${esc(na.line1)}" autocomplete="address-line1" placeholder="House / flat no., street"></label>
      <label class="field">Address line 2<input name="a_line2" value="${esc(na.line2)}" autocomplete="address-line2" placeholder="Area, landmark"></label></div>
      <div class="form-row-3">
        ${S.mode === "home" ? `<label class="field">City<input value="${esc(S.city)}" readonly></label>` : `<label class="field">City <span class="req">*</span><input name="a_city" value="${esc(na.city)}" autocomplete="address-level2"></label>`}
        <label class="field">State / Province <span class="req">*</span><input name="a_state" value="${esc(na.state || (S.mode === "home" ? (A.city(S.city) || {}).state || "" : ""))}" autocomplete="address-level1"></label>
        <label class="field">${co.code === "IN" || S.mode === "home" ? "PIN code" : "ZIP / Postal code"} <span class="req">*</span><input name="a_pin" value="${esc(na.pin)}" autocomplete="postal-code"></label>
      </div>`;

    return `<form class="panel form" id="detailsForm" novalidate>
      <div><h2>Your details</h2><p class="panel-intro" style="margin:0">For <strong>${esc(p.name)}</strong> · ${S.mode === "online" ? "Online puja" : "Pandit at home"}. Filled in from your profile – change anything for this booking.</p></div>

      <fieldset class="group"><legend>Contact</legend>
        <div class="form">
          <div class="form-row-3">
            <label class="field">Full name <span class="req">*</span><input name="name" value="${esc(S.name)}" required autocomplete="name"></label>
            <label class="field">Mobile number <span class="req">*</span><input name="phone" value="${esc(S.phone)}" required autocomplete="tel" inputmode="tel"></label>
            <label class="field">Email <span class="req">*</span><input name="email" type="email" value="${esc(S.email)}" required autocomplete="email"></label>
          </div>
        </div>
      </fieldset>

      ${S.mode === "online" ? `
      <fieldset class="group"><legend>Where are you joining from?</legend>
        <div class="form">
          <div class="form-row">
            <label class="field">Country <span class="req">*</span>
              <select name="countryCode">${A.countries().map((c) => `<option value="${c.code}"${c.code === co.code ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
            <label class="field">Time zone <span class="req">*</span>
              <select name="tz">${co.zones.map(([z, l]) => `<option value="${z}"${z === tz() ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
          </div>
          ${co.code !== "IN" ? `<p class="notice notice-ok">${icon("globe")}<span>Time slots will be shown in your local time. International cards and PayPal are accepted.</span></p>` : ""}
          <label class="check"><input type="checkbox" name="prasadam" ${S.prasadam && co.prasadam.available ? "checked" : ""} ${co.prasadam.available ? "" : "disabled"}>
            <span><strong>Ship Prasadam to me</strong> – ${co.prasadam.available ? `${money(co.prasadam.charge)} to ${esc(co.name)}, ${esc(co.prasadam.days)} after the puja` : esc(co.prasadam.days)}</span></label>
        </div>
      </fieldset>` : `
      <fieldset class="group"><legend>Where should the Pandit come?</legend>
        <div class="form">
          ${homeOutside ? `<p class="notice notice-warn">${icon("globe")}<span>Pandit home visits are available in India only. For families abroad we recommend a <a class="link-btn" href="book.html?mode=online&puja=${esc(p.modes.includes("online") ? p.id : "")}">live Online Puja</a>.</span></p>` : ""}
          ${cityKnownNotServed ? `<p class="notice notice-warn">${icon("info")}<span>We don't send Pandits to ${esc(prof.city)} yet. Choose a nearby city below${p.modes.includes("online") ? `, or <a class="link-btn" href="book.html?mode=online&puja=${esc(p.id)}">book this puja online</a>` : ""}.</span></p>` : ""}
          <label class="field">City <span class="req">*</span>
            <select name="city" required><option value="">Select your city</option>${A.activeCities().map((c) => `<option${c.name === S.city ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
          ${S.city ? `<p class="hint">${icon("priest")} ${A.pandits().filter((x) => x.active && x.modes.includes("home") && x.cities.includes(S.city)).length} Pandits serve ${esc(S.city)}.${(A.city(S.city) || {}).travel ? ` Travel charge: ${money(A.city(S.city).travel)}.` : " No travel charge."}</p>` : ""}
          ${p.samagri ? `<label class="check"><input type="checkbox" name="samagri" ${S.samagri ? "checked" : ""}><span><strong>Add puja samagri kit</strong> – ${money(p.samagri)}. Everything for the ritual is brought by the Pandit.</span></label>` : ""}
        </div>
      </fieldset>`}

      ${S.mode === "online" || S.city ? `
      <fieldset class="group"><legend>${S.mode === "online" ? "Prasadam delivery address" : "Puja address"}</legend>
        <div class="form">
          ${addrs.length ? `<label class="field">Choose address
            <select name="addrId">${addrs.map((a) => `<option value="${esc(a.id)}"${a.id === S.addrId ? " selected" : ""}>${esc(a.label || "Saved")} – ${esc(A.fmtAddress(a))}</option>`).join("")}
              <option value="new"${S.addrId === "new" ? " selected" : ""}>+ Add a new address</option></select></label>` : ""}
          <div data-newaddr ${S.addrId === "new" ? "" : "hidden"}>${newAddrFields}</div>
        </div>
      </fieldset>` : ""}

      ${(p.fields || []).map((k) => FIELDSETS[k]).filter(Boolean).map((fs) => `
      <fieldset class="group"><legend>${fs.title}</legend>
        <div class="form">
          ${fs.hint ? `<p class="hint">${icon("info")} ${fs.hint}</p>` : ""}
          <div class="form-row">
            ${fs.fields.map(([key, label, type, req]) => type === "textarea"
              ? `</div><label class="field">${label}<textarea name="d_${key}" rows="2">${esc(S.details[key])}</textarea></label><div class="form-row">`
              : `<label class="field">${label}${req ? ' <span class="req">*</span>' : ""}<input name="d_${key}" type="${type || "text"}" value="${esc(S.details[key])}" ${req ? "required" : ""}></label>`).join("")}
          </div>
        </div>
      </fieldset>`).join("")}

      <fieldset class="group"><legend>Preferences</legend>
        <div class="form">
          <label class="field">Preferred language of the Pandit
            <select name="language"><option value="">No preference</option>${B.languages.map((l) => `<option${l === S.language ? " selected" : ""}>${l}</option>`).join("")}</select></label>
          <label class="field">Special instructions (optional)
            <textarea name="instructions" rows="3" placeholder="Family traditions, items you already have, parking or entry details…">${esc(S.instructions)}</textarea></label>
        </div>
      </fieldset>

      <p class="form-error" id="detailsError" role="alert" hidden></p>
      <div class="wizard-nav">
        <button type="button" class="btn btn-outline" data-back>${icon("back")} Back</button>
        <button type="submit" class="btn btn-primary btn-lg">Choose date &amp; time ${icon("arrow")}</button>
      </div>
    </form>`;
  }

  function readDetails(form) {
    const fd = new FormData(form);
    const g = (k) => String(fd.get(k) || "").trim();
    S.name = g("name"); S.phone = g("phone"); S.email = g("email");
    S.language = g("language"); S.instructions = g("instructions");
    if (S.mode === "online") {
      S.countryCode = g("countryCode") || S.countryCode;
      S.tz = g("tz") || S.tz;
      S.prasadam = !!fd.get("prasadam");
    } else {
      S.city = g("city");
      S.samagri = !!fd.get("samagri");
    }
    if (form.addrId) S.addrId = g("addrId");
    else if (form.a_line1) S.addrId = "new";
    if (form.a_line1) S.newAddr = { line1: g("a_line1"), line2: g("a_line2"), city: S.mode === "home" ? S.city : g("a_city"), state: g("a_state"), pin: g("a_pin") };
    S.details = {};
    for (const [k, v] of fd.entries()) if (k.startsWith("d_") && String(v).trim()) S.details[k.slice(2)] = String(v).trim();
    save();
  }

  function bind3() {
    const back = $("[data-back]");
    if (back) back.addEventListener("click", () => go(puja() && U.qs("puja") && !U.qs("mode") ? 1 : 2));
    const form = $("#detailsForm");
    if (!form) return;
    // Changes that alter the form re-render it (keeping typed values)
    ["countryCode", "city", "addrId"].forEach((n) => {
      const el = form.elements[n];
      if (el) el.addEventListener("change", () => {
        readDetails(form);
        if (n === "countryCode") S.tz = "";
        if (n !== "addrId") { S.date = S.slot = ""; }
        render();
      });
    });
    form.addEventListener("change", (e) => { if (["prasadam", "samagri", "tz"].includes(e.target.name)) { readDetails(form); renderSummary(); } });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      readDetails(form);
      const err = $("#detailsError");
      const bad = [];
      $$("[required]", form).forEach((el) => { const miss = !el.value.trim(); el.classList.toggle("invalid", miss); if (miss) bad.push(el); });
      const phoneOk = /^\+?[0-9\s-]{8,16}$/.test(S.phone);
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email);
      form.phone.classList.toggle("invalid", !phoneOk);
      form.email.classList.toggle("invalid", !emailOk);
      let msg = "";
      if (bad.length) msg = "Please fill in the required fields.";
      else if (!phoneOk) msg = "Please enter a valid mobile number.";
      else if (!emailOk) msg = "Please enter a valid email address.";
      else if (S.mode === "home" && !S.city) msg = "Please choose your city.";
      else if (S.addrId === "new") {
        const a = S.newAddr;
        const need = ["line1", "state", "pin"].concat(S.mode === "online" ? ["city"] : []);
        const missing = need.filter((k) => !a[k]);
        missing.forEach((k) => form["a_" + k] && form["a_" + k].classList.add("invalid"));
        if (missing.length) msg = "Please complete the address.";
      }
      if (msg) { err.textContent = msg; err.hidden = false; (form.querySelector(".invalid") || err).focus(); return; }
      err.hidden = true;
      // Save new contact details / address to the profile
      const u = A.currentUser();
      if (!u.name) u.name = S.name;
      if (!u.phone) u.phone = S.phone;
      if (!u.email) u.email = S.email;
      if (S.addrId === "new") {
        const addr = Object.assign({ id: "a" + Date.now().toString(36), label: S.mode === "home" ? "Puja address" : "Delivery address", country: S.mode === "home" ? "IN" : S.countryCode }, S.newAddr);
        if (!u.address || !u.address.line1) { u.address = Object.assign({}, addr); delete u.address.id; delete u.address.label; S.addrId = "home"; }
        else { u.addresses = (u.addresses || []).concat(addr); S.addrId = addr.id; }
        S.newAddr = {};
      }
      A.saveUser(u);
      go(4);
    });
  }

  /* ---------------- Step 4: date & slot ---------------- */
  function step4() {
    const p = puja();
    return `<div class="panel">
      <h2>Choose a date &amp; time</h2>
      <p class="panel-intro">Only times when a Pandit is actually free ${S.mode === "home" ? `in <strong>${esc(S.city)}</strong>` : ""} are shown. ${esc(p.name)} takes about ${esc(p.duration)}.</p>
      ${p.id === "thithi-shraddham" ? `<p class="notice">${icon("info")}<span>Pick the date of this year's thithi if you know it. If not, choose any date – our Pandit will call you to confirm the correct thithi before the ceremony.</span></p>` : ""}
      <div id="slotPicker"></div>
      <div class="wizard-nav">
        <button class="btn btn-outline" data-back>${icon("back")} Back</button>
        <button class="btn btn-primary btn-lg" data-next ${S.date && S.slot ? "" : "disabled"}>Review booking ${icon("arrow")}</button>
      </div>
    </div>`;
  }
  function bind4() {
    U.slotPicker($("#slotPicker"), {
      date: S.date, slot: S.slot, mode: () => S.mode, city: () => S.city, tz,
      onChange: (st) => { S.date = st.date; S.slot = st.slot; save(); $("[data-next]").disabled = !(S.date && S.slot); renderSummary(); }
    });
    const st = $("#slotPicker [data-date]");
    if (st && !S.date) { S.date = st.value; save(); }
    $("[data-back]").addEventListener("click", () => go(3));
    $("[data-next]").addEventListener("click", () => go(5));
  }

  /* ---------------- Step 5: review & pay ---------------- */
  function bookingAddress() {
    const u = A.currentUser();
    return A.allAddresses(u).find((a) => a.id === S.addrId) || null;
  }
  function step5() {
    const p = puja(), co = country(), q = A.quote(quoteInput()), addr = bookingAddress();
    const intl = co.code !== "IN";
    const methods = intl
      ? [["International card", "card", "Visa, Mastercard, Amex"], ["PayPal", "globe", ""], ["Apple / Google Pay", "phone", ""]]
      : [["UPI", "phone", "GPay, PhonePe, Paytm"], ["Debit / Credit card", "card", ""], ["Net banking", "shield", ""]];
    if (!methods.some((m) => m[0] === S.pay)) S.pay = methods[0][0];
    const detailRows = Object.entries(S.details).map(([k, v]) => `${esc(k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()))}: ${esc(v)}`).join("<br>");
    return `<div class="panel">
      <h2>Review &amp; pay</h2>
      <p class="panel-intro">Please check your booking. It is confirmed only after payment succeeds.</p>
      <div class="review-grid">
        <div class="review-box"><h4>Puja <button class="link-btn" data-edit="2">Change</button></h4><p><strong>${esc(p.name)}</strong><br>${S.mode === "online" ? "Live online puja" : "Pandit at your home"} · ${esc(p.duration)}</p></div>
        <div class="review-box"><h4>Date &amp; time <button class="link-btn" data-edit="4">Change</button></h4><p>${A.fmtDay(S.date, S.slot, tz(), true)}<br><strong>${A.fmtTime(S.date, S.slot, tz())}</strong>${tz() !== "Asia/Kolkata" ? ` your time (${A.fmtTime(S.date, S.slot)} IST)` : " IST"}</p></div>
        <div class="review-box"><h4>${S.mode === "home" ? "Puja address" : "Prasadam address"} <button class="link-btn" data-edit="3">Change</button></h4><p>${S.mode === "online" && !(S.prasadam && co.prasadam.available) ? "No Prasadam delivery" : esc(A.fmtAddress(addr))}</p></div>
        <div class="review-box"><h4>Contact <button class="link-btn" data-edit="3">Change</button></h4><p>${esc(S.name)}<br>${esc(S.phone)} · ${esc(S.email)}</p></div>
        ${detailRows || S.instructions || S.language ? `<div class="review-box" style="grid-column:1/-1"><h4>Puja details <button class="link-btn" data-edit="3">Change</button></h4><p>${detailRows}${S.language ? `${detailRows ? "<br>" : ""}Language: ${esc(S.language)}` : ""}${S.instructions ? `<br>Instructions: ${esc(S.instructions)}` : ""}</p></div>` : ""}
      </div>

      <h3>Price</h3>
      <table class="price-table">${q.lines.map((l) => `<tr><td>${esc(l.label)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</td><td>${money(l.amount)}</td></tr>`).join("")}
        <tr class="total"><td>Total payable</td><td>${money(q.total)}</td></tr></table>
      ${intl ? `<p class="price-approx">${U.approx(q.total, co.code)} · charged in INR, your bank converts it</p>` : ""}

      <h3 style="margin-top:24px">Payment method</h3>
      <div class="pay-methods">
        ${methods.map(([label, ic, sub]) => `<button type="button" class="choice${S.pay === label ? " selected" : ""}" data-pay="${esc(label)}">${icon(ic)}<span><strong>${esc(label)}</strong>${sub ? `<p>${esc(sub)}</p>` : ""}</span></button>`).join("")}
      </div>
      <p class="demo-note" style="margin-top:12px">${icon("info")} Prototype: payment is simulated. No money is charged and no card details are collected.</p>

      <label class="check" style="margin-top:18px"><input type="checkbox" id="agree"><span>I agree to the cancellation policy: full refund if cancelled 48+ hours before, 50% if 24–48 hours before. Reschedule free up to 24 hours before.</span></label>
      <p class="form-error" id="payError" role="alert" hidden></p>
      <div class="wizard-nav">
        <button class="btn btn-outline" data-back>${icon("back")} Back</button>
        <button class="btn btn-primary btn-lg" data-pay-now>${icon("lock")} Pay ${money(q.total)}</button>
      </div>
    </div>`;
  }
  function bind5() {
    $$("[data-edit]").forEach((b) => b.addEventListener("click", () => go(+b.dataset.edit)));
    $$("[data-pay]").forEach((b) => b.addEventListener("click", () => { S.pay = b.dataset.pay; save(); $$("[data-pay]").forEach((x) => x.classList.toggle("selected", x === b)); }));
    $("[data-back]").addEventListener("click", () => go(4));
    $("[data-pay-now]").addEventListener("click", () => {
      const err = $("#payError");
      if (!$("#agree").checked) { err.textContent = "Please accept the cancellation policy to continue."; err.hidden = false; return; }
      const u = A.currentUser();
      if (!u) { go(3); return; }
      const main = $("#wizardMain");
      main.innerHTML = `<div class="panel"><div class="processing"><span class="spinner"></span><h3>Processing payment…</h3><p class="muted">Please don't close this page.</p></div></div>`;
      setTimeout(() => {
        try {
          const addr = bookingAddress();
          const b = A.createBooking({
            pujaId: S.pujaId, mode: S.mode, date: S.date, slot: S.slot, city: S.city, tz: tz(), countryCode: country().code,
            samagri: S.samagri, prasadam: S.prasadam && country().prasadam.available, address: addr ? Object.assign({}, addr) : null,
            name: S.name, phone: S.phone, email: S.email, language: S.language, details: S.details, instructions: S.instructions, paymentMethod: S.pay
          });
          S = Object.assign(fresh(), { step: 6, lastId: b.id });
          go(6);
          U.toast(`<strong>SMS (demo) to ${esc(b.phone)}</strong><br>Booking ${b.id} confirmed for ${esc(b.pujaName)}.`, "sms", 6000);
        } catch (e) {
          render();
          const er = $("#payError");
          if (er) { er.textContent = e.message; er.hidden = false; }
          if (/slot/.test(e.message)) setTimeout(() => go(4), 1800);
        }
      }, 1600);
    });
  }

  /* ---------------- Step 6: confirmation ---------------- */
  function step6() {
    const b = A.booking(S.lastId);
    if (!b) { S = fresh(); return step1(); }
    const pd = A.pandit(b.panditId) || {};
    const btz = b.tz;
    const summaryText = `Namaste, my booking ${b.id}: ${b.pujaName} (${b.mode === "online" ? "online" : "at home"}) on ${A.fmtDay(b.date, b.slot)} at ${A.fmtTime(b.date, b.slot)} IST.`;
    return `<div class="panel">
      <div class="confirm-head">
        <span class="success-icon">${icon("check")}</span>
        <h2>Your puja is booked!</h2>
        <p class="muted">Payment received · Booking ID <span class="booking-id">${b.id}</span></p>
        <div class="channels">
          <span class="badge badge-green">${icon("phone")} SMS sent</span>
          <span class="badge badge-green">${icon("mail")} Email sent</span>
          <span class="badge badge-green">${icon("whatsapp")} WhatsApp sent</span>
        </div>
        <p class="hint" style="justify-content:center;margin-top:8px">Prototype: messages are recorded, not actually sent.</p>
      </div>

      ${b.mode === "online" ? `
        <div class="meet-box">
          <div><strong>Your live puja link</strong><br><code>${esc(b.meetingLink)}</code><br><small class="muted">Join 10 minutes early. The link also opens from My Bookings.</small></div>
          <a class="btn btn-primary" href="${esc(b.meetingLink)}" target="_blank" rel="noopener">${icon("video")} Open link</a>
        </div>` : ""}

      <div class="review-grid">
        <div class="review-box"><h4>${esc(b.pujaName)}</h4><p>${A.fmtDay(b.date, b.slot, btz, true)}<br><strong>${A.fmtTime(b.date, b.slot, btz)}</strong>${btz !== "Asia/Kolkata" ? ` your time (${A.fmtTime(b.date, b.slot)} IST)` : " IST"}</p></div>
        <div class="review-box"><h4>Your Pandit</h4><p><strong>${esc(pd.name || "Being assigned")}</strong><br>${pd.experience ? `${pd.experience} years · ${esc((pd.languages || []).join(", "))}` : ""}
          ${b.mode === "home" ? `<br>Arrives about 30 minutes before the puja at:<br>${esc(A.fmtAddress(b.address))}` : ""}</p></div>
        ${b.prasadam ? `<div class="review-box"><h4>Prasadam</h4><p>Packed after the puja and shipped to ${esc(A.fmtAddress(b.address))}. Track it in My Bookings.</p></div>` : ""}
        <div class="review-box"><h4>Paid</h4><p><strong>${money(b.total)}</strong> by ${esc(b.payment.method)}<br>Ref ${esc(b.payment.txnId)}</p></div>
      </div>

      <div class="wizard-nav" style="justify-content:flex-start">
        <a class="btn btn-primary" href="dashboard.html#bookings">${icon("calendar")} My Bookings</a>
        <a class="btn btn-outline" href="${U.icsFor(b)}" download="${b.id}.ics">Add to calendar</a>
        <a class="btn btn-whatsapp" href="${U.waLink(summaryText)}" target="_blank" rel="noopener">${icon("whatsapp")} Message us</a>
        <a class="btn btn-link" href="book.html">Book another puja</a>
      </div>
    </div>`;
  }

  /* ---------------- Render ---------------- */
  function render() {
    if (S.step < 6) {
      if (S.step >= 2 && !S.mode) S.step = 1;
      if (S.step >= 3 && !S.pujaId) S.step = 2;
      if (S.step >= 5 && !(S.date && S.slot)) S.step = 4;
      if (S.step >= 4 && !A.currentUser()) S.step = 3;
    }
    save();
    const views = [null, [step1, bind1], [step2, bind2], [step3, bind3], [step4, bind4], [step5, bind5], [step6, () => {}]];
    const [view, bind] = views[S.step];
    $("#wizardMain").innerHTML = view();
    bind();
    renderStepper();
    renderSummary();
    const title = { online: "Book an Online Puja", home: "Book a Pandit at Home" }[S.mode];
    $("#bookTitle").textContent = title || "Book a Puja";
    document.title = (title || "Book a Puja") + " – Agni Puja";
  }
  render();
})();
