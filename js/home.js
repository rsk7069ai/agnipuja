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
        <div class="card-price">From <strong>${money(A.startingPrice(p))}</strong> · ${esc(p.duration)}</div>
        <div class="card-actions">
          <a class="btn btn-primary" href="book.html?puja=${esc(p.id)}${p.modes.length === 1 ? "&mode=" + p.modes[0] : ""}">Book Now</a>
          <a class="btn btn-link" href="puja.html?id=${esc(p.id)}">Details ${icon("arrow")}</a>
        </div>
      </div>
    </article>`).join("");

  /* NRI: pick a country, see local time vs India time and Prasadam info */
  const abroad = A.countries().filter((c) => c.code !== "IN");
  let pick = A.sRead("nriCountry", null) || (abroad[0] && abroad[0].code);
  function renderNri() {
    $("#nriCountries").innerHTML = abroad.map((c) =>
      `<button type="button" class="chip${c.code === pick ? " active" : ""}" data-country="${c.code}">${esc(c.name)}</button>`).join("");
    const co = A.country(pick);
    const tz = co.zones[0][0];
    const now = new Date();
    const f = (zone) => new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(now);
    const fd = (zone) => new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "short", day: "numeric", month: "short" }).format(now);
    // A typical morning puja in India, shown in local time
    const sample = A.istToday(1);
    const good = A.DATA.booking.slots.filter((s) => { const h = A.localHour(sample, s, tz); return h >= 6 && h < 22; });
    $("#nriPanel").innerHTML = `
      <h3>${esc(co.name)}</h3>
      <div class="clock-pair">
        <div class="clock"><span>Your time (${esc(co.zones[0][1])})</span><strong>${f(tz)}</strong><small>${fd(tz)}</small></div>
        <div class="clock"><span>India (IST)</span><strong>${f("Asia/Kolkata")}</strong><small>${fd("Asia/Kolkata")}</small></div>
      </div>
      <ul class="tick-list">
        <li>${icon("clock")} <span><strong>${good.length} of ${A.DATA.booking.slots.length}</strong> daily puja slots fall between 6 AM and 10 PM your time${good[0] ? ` – e.g. ${A.fmtTime(sample, good[0], tz)} your time` : ""}.</span></li>
        <li>${icon("truck")} <span>${co.prasadam.available ? `Prasadam delivery available: <strong>${money(co.prasadam.charge)}</strong>, ${esc(co.prasadam.days)}.` : `Prasadam delivery: ${esc(co.prasadam.days)}. You can still join the live puja.`}</span></li>
        <li>${icon("card")} <span>No online payment – pay after the puja by bank transfer. Prices in ₹ with ${esc(co.currency)} shown approximately.</span></li>
      </ul>
      <a class="btn btn-primary btn-block" href="book.html?mode=online&country=${co.code}">Book Online Puja from ${esc(co.name)}</a>`;
    $$("[data-country]").forEach((b) => b.addEventListener("click", () => { pick = b.dataset.country; A.sWrite("nriCountry", pick); renderNri(); }));
  }
  renderNri();

  /* FAQs */
  $("#faqList").innerHTML = A.DATA.faqs.map((f, i) =>
    `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
})();
