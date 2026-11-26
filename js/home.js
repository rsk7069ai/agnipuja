/* Agni Puja – new homepage sections: service prices, featured pujas,
   NRI time-zone helper and FAQs. (The original sections are in main.js.) */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI;
  const { $, $$, esc, icon, money } = U;

  /* Starting prices on the two service cards */
  $$("[data-price-from]").forEach((el) => {
    const mode = el.dataset.priceFrom;
    const prices = A.pujas().filter((p) => (p.modes || []).includes(mode)).map((p) => p.price[mode]);
    if (prices.length) el.innerHTML = `Pujas from <strong>${money(Math.min(...prices))}</strong>`;
  });
  $$("[data-city-count]").forEach((el) => (el.textContent = A.activeCities().length));

  /* Featured pujas */
  const featured = A.pujas().filter((p) => p.featured);
  $("#featuredGrid").innerHTML = featured.map((p) => `
    <article class="card featured-card">
      <span class="ribbon">${icon("flame")} Featured</span>
      ${U.media(p)}
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <div class="mode-pills">${(p.modes || []).map(U.modeBadge).join("")}</div>
        <p>${esc(p.short)}</p>
        <div class="card-price">${U.showPrices ? `From <strong>${money(A.startingPrice(p))}</strong> · ` : ""}${esc(p.duration)}</div>
        <div class="card-actions">
          <a class="btn btn-primary" href="book.html?puja=${esc(p.id)}${p.modes.length === 1 ? "&mode=" + p.modes[0] : ""}">Book Now</a>
          <a class="btn btn-link" href="puja.html?id=${esc(p.id)}">Details ${icon("arrow")}</a>
        </div>
      </div>
    </article>`).join("");

  /* NRI: pick a country, see how online puja works from there */
  const abroad = A.countries().filter((c) => c.code !== "IN");
  let pick = A.sRead("nriCountry", null) || (abroad[0] && abroad[0].code);
  function renderNri() {
    $("#nriCountries").innerHTML = abroad.map((c) =>
      `<button type="button" class="chip${c.code === pick ? " active" : ""}" data-country="${c.code}">${c.other ? `${icon("globe")} Other countries` : esc(c.name)}</button>`).join("");
    const co = A.country(pick) || abroad[0];
    $("#nriPanel").innerHTML = `
      <h3>${co.other ? "Online puja from anywhere in the world" : `Online puja from ${esc(co.name)}`}</h3>
      <ul class="tick-list">
        <li>${icon("video")} <span>Join the live puja on video from your home${co.other ? ", wherever you live" : ""}.</span></li>
        <li>${icon("clock")} <span>We fix a time that suits your time zone when we call you.</span></li>
        <li>${icon("truck")} <span>${co.other
          ? "Prasadam can be shipped to most countries – we confirm delivery to yours on the call."
          : co.prasadam.available
          ? `Prasadam delivered to ${esc(co.name)}${U.showPrices ? ` (${money(co.prasadam.charge)})` : ""} in ${esc(co.prasadam.days)}.`
          : `Prasadam can't be shipped to ${esc(co.name)} at the moment – you can still join the live puja.`}</span></li>
        <li>${icon("card")} <span>No payment now – pay after the puja by bank transfer.</span></li>
      </ul>
      <a class="btn btn-primary btn-block" href="book.html?mode=online&country=${co.code}">Book Online Puja</a>`;
    $$("[data-country]").forEach((b) => b.addEventListener("click", () => { pick = b.dataset.country; A.sWrite("nriCountry", pick); renderNri(); }));
  }
  renderNri();

  /* Today's Panchang (calculated in js/panchang.js) */
  const realToday = A.istToday();
  const pgMin = A.addDays(realToday, -365), pgMax = A.addDays(realToday, 730);
  // ?panchang=YYYY-MM-DD in the address bar opens another day
  const pgStart = U.qs("panchang");
  let pgDate = /^\d{4}-\d{2}-\d{2}$/.test(pgStart || "") ? pgStart : realToday;

  function renderPanchang() {
    const box = $("#panchangBox");
    if (!box || !window.Panchang) return;
    const P = window.Panchang, loc = A.DATA.site.panchangLocation;
    const today = pgDate; // the day being shown
    const isToday = today === realToday;
    let d, next;
    try { d = P.day(today, loc); next = P.upcoming(today, loc, 30); } catch (e) { box.closest("section").hidden = true; return; }
    const ist = (jd, opts) => new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "Asia/Kolkata" }, opts)).format(new Date(P.msFromJd(jd)));
    // non-breaking space keeps "6:12 AM" together when the line wraps
    const t = (jd) => ist(jd, { hour: "numeric", minute: "2-digit" }).replace(/\s/g, " ");
    const dayOf = (jd) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(P.msFromJd(jd)));
    const till = (jd) => !jd ? "" : `till ${t(jd)}${dayOf(jd) !== today ? ", " + ist(jd, { day: "numeric", month: "short" }) : ""}`;
    // "1:22 – 2:47 PM" (or "11:56 AM – 1:22 PM" when it crosses noon)
    const range = (p) => { const a = t(p.start), b = t(p.end); return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`; };
    const bookLink = (pid) => { const p = A.puja(pid); return p ? `book.html?puja=${encodeURIComponent(pid)}${p.modes.length === 1 ? "&mode=" + p.modes[0] : ""}` : "book.html"; };
    const nice = (ymd) => new Date(ymd + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    const special = d.specials[0] || (d.tamil.firstDay ? { name: `First day of ${d.tamil.month}`, puja: "tharpanam", note: "Tharpanam is offered on the first day of the Tamil month." } : null);
    const item = (label, value, sub, cls = "") => `<div class="pg-item ${cls}"><span>${label}</span><strong>${value}</strong>${sub ? `<small>${sub}</small>` : ""}</div>`;

    box.innerHTML = `
      <div class="pg-head">
        <div>
          <p class="eyebrow">${icon("calendar")} ${isToday ? "Today's Panchang" : "Panchang"}</p>
          <h2 id="panchangTitle">${esc(d.weekday)}, ${new Date(today + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</h2>
          <p class="pg-sub">${esc(d.tamil.month)} ${d.tamil.day} · ${esc(loc.name)}</p>
          <div class="pg-controls">
            <button type="button" class="icon-btn" data-pg-step="-1" aria-label="Previous day" ${today <= pgMin ? "disabled" : ""}>${icon("back")}</button>
            <input type="date" class="input" value="${today}" min="${pgMin}" max="${pgMax}" data-pg-date aria-label="Choose a date to see its panchang">
            <button type="button" class="icon-btn" data-pg-step="1" aria-label="Next day" ${today >= pgMax ? "disabled" : ""}>${icon("arrow")}</button>
            ${isToday ? "" : `<button type="button" class="btn btn-link btn-sm" data-pg-today>Back to today</button>`}
          </div>
        </div>
        ${special ? `<div class="pg-special">
          <span class="ribbon">${icon("flame")} ${isToday ? "Today" : "On this day"}</span>
          <div><strong>${esc(special.name)}</strong><p>${esc(special.note)}</p></div>
          <a class="btn btn-primary btn-sm" href="${bookLink(special.puja)}">Book ${esc((A.puja(special.puja) || { name: "a Puja" }).name)}</a>
        </div>` : ""}
      </div>
      <div class="pg-grid">
        ${item("Tithi", esc(d.tithi.name), d.tithi.end ? `${till(d.tithi.end)}, then ${esc(d.tithi.next)}` : "")}
        ${item("Nakshatram", esc(d.nakshatra.name), till(d.nakshatra.end))}
        ${item("Yoga", esc(d.yoga.name), till(d.yoga.end))}
        ${item("Sunrise", t(d.sunrise), "", "pg-time")}
        ${item("Sunset", t(d.sunset), "", "pg-time")}
        ${item("Rahu Kalam", range(d.rahu), "", "pg-time")}
        ${item("Yamagandam", range(d.yamagandam), "", "pg-time")}
        ${item("Gulika", range(d.gulika), "", "pg-time")}
      </div>
      ${!d.chandrashtamam ? "" : (() => {
        const c = d.chandrashtamam, stars = (x) => x.stars.map(esc).join(" · ");
        return `<div class="pg-nalla pg-ashtama">
          <span class="pg-nalla-label">${icon("info")} Chandrashtamam</span>
          <span class="pg-ashtama-text"><strong>${esc(c.rasi)}</strong> – ${stars(c)}${c.end ? ` <em>${till(c.end)}</em>` : ""}${c.next ? `<br>then <strong>${esc(c.next.rasi)}</strong> – ${stars(c.next)}` : ""}</span>
        </div>`;
      })()}
      ${(d.nallaNeram || []).length ? `<div class="pg-nalla">
        <span class="pg-nalla-label">${icon("check")} Nalla Neram</span>
        <span class="pg-nalla-times">${d.nallaNeram.map((p) => `<strong>${range(p)}</strong>`).join("")}</span>
        <small>Good times from the Gowri Panchangam, avoiding Rahu Kalam and Yamagandam</small>
      </div>` : ""}
      ${next.length ? `<div class="pg-next"><span>Coming up</span>
        ${next.slice(0, 6).map((u) => `<a class="chip" href="${bookLink(u.puja)}" title="${esc(u.note)}"><strong>${nice(u.date)}</strong> ${esc(u.name)}</a>`).join("")}
      </div>` : ""}
      <p class="hint pg-note">${icon("info")} Timings for ${esc(loc.name)}, calculated for the day. Please confirm with our Pandit for important muhurtham.</p>`;

    // Date controls
    const go = (ymd) => {
      if (!ymd || ymd < pgMin || ymd > pgMax) return;
      pgDate = ymd;
      renderPanchang();
    };
    $$("[data-pg-step]", box).forEach((b) => b.addEventListener("click", () => {
      go(A.addDays(pgDate, +b.dataset.pgStep));
      const same = $(`[data-pg-step="${b.dataset.pgStep}"]`, box);
      if (same && !same.disabled) same.focus();
    }));
    $("[data-pg-date]", box).addEventListener("change", (e) => go(e.target.value));
    const back = $("[data-pg-today]", box);
    if (back) back.addEventListener("click", () => { go(realToday); const inp = $("[data-pg-date]", box); if (inp) inp.focus(); });
  }
  renderPanchang();

  /* FAQs */
  $("#faqList").innerHTML = A.DATA.faqs.map((f, i) =>
    `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
})();
