/* Agni Puja – homepage behaviour.
   Content lives in js/pujas-data.js; this file only renders it. */
(function () {
  "use strict";

  const DATA = window.AGNI_DATA;
  const SITE = DATA.site;
  const PUJAS = DATA.pujas;
  const TYPE_LABEL = { homam: "Homam", pooja: "Pooja", ceremony: "Ceremony" };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const findPuja = (id) => PUJAS.find((p) => p.id === id);

  const waLink = (text) =>
    `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text || "Namaste, I would like to enquire about a puja.")}`;

  /* Image with a graceful fallback: if the photo is missing, the decorative
     saffron gradient + flame shows instead (see .media in styles.css). */
  const media = (p, cls = "") =>
    `<div class="media ${cls}">
       ${icon("flame")}
       ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : ""}
     </div>`;

  /* Starting price and booking types, e.g. "From ₹2,100 · Online & at home" */
  function priceLine(p) {
    const prices = (p.modes || []).map((m) => (p.price || {})[m]).filter(Boolean);
    if (!prices.length) return "";
    const modes = (p.modes || []).map((m) => (m === "online" ? "Online" : "At home")).join(" & ");
    const showPrices = !window.AgniUI || window.AgniUI.showPrices;
    return `<div class="card-price">${showPrices ? `From <strong>₹${Math.min(...prices).toLocaleString("en-IN")}</strong> · ` : ""}${modes}</div>`;
  }

  /* ---------------- Render: puja cards ---------------- */
  function renderPujas() {
    $("#pujaGrid").innerHTML = PUJAS.map(
      (p) => `
      <article class="card puja-card" data-type="${esc(p.type)}">
        ${media(p)}
        <div class="card-body">
          <span class="tag">${TYPE_LABEL[p.type] || "Puja"}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.short)}</p>
          ${priceLine(p)}
          <button class="btn btn-soft btn-block" data-details="${esc(p.id)}">View Details ${icon("arrow")}</button>
        </div>
      </article>`
    ).join("");
  }

  /* ---------------- Render: popular homams ---------------- */
  function renderHomams() {
    const list = PUJAS.filter((p) => p.type === "homam" && p.popular);
    $("#homamList").innerHTML = list
      .map(
        (p) => `
      <article class="card homam-card">
        ${media(p)}
        <div class="card-body">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.short)}</p>
          <ul class="mini-meta">
            <li>${icon("clock")} ${esc(p.duration)}</li>
            <li>${icon("heart")} ${esc(p.idealFor)}</li>
          </ul>
          <div class="card-actions">
            <button class="btn btn-primary" data-enquire="${esc(p.id)}">Enquire</button>
            <button class="btn btn-link" data-details="${esc(p.id)}">Details ${icon("arrow")}</button>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  /* ---------------- Render: occasions ---------------- */
  function renderOccasions() {
    $("#occasionGrid").innerHTML = DATA.occasions
      .map(
        (o) => `
      <button class="occasion" data-details="${esc(o.puja)}">
        <span class="occasion-icon">${icon(o.icon)}</span>
        <span class="occasion-text">
          <strong>${esc(o.title)}</strong>
          <span>${esc(o.text)}</span>
        </span>
        ${icon("arrow")}
      </button>`
      )
      .join("");
  }

  /* ---------------- Render: testimonials ---------------- */
  function renderTestimonials() {
    const list = DATA.testimonials || [];
    const grid = $("#testimonialGrid");
    const share = waLink("Namaste Agni Puja, I would like to share my experience of the puja:");
    // Until real reviews are added in js/pujas-data.js, invite customers to share theirs.
    if (!list.length) {
      grid.classList.add("testimonial-invite");
      grid.innerHTML = `<div class="card testimonial">
        <div class="stars" aria-hidden="true">★★★★★</div>
        <blockquote>Had a puja with us? We would be grateful to hear about your experience – your words help other families.</blockquote>
        <a class="btn btn-primary" href="${share}" target="_blank" rel="noopener">${icon("whatsapp")} Share your experience</a>
      </div>`;
      return;
    }
    grid.insertAdjacentHTML("afterend", `<p style="text-align:center;margin-top:28px"><a class="btn btn-outline" href="${share}" target="_blank" rel="noopener">${icon("whatsapp")} Share your experience</a></p>`);
    grid.innerHTML = list
      .map((t) => {
        const initials = t.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
        return `
      <figure class="card testimonial">
        <div class="stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>“${esc(t.text)}”</blockquote>
        <figcaption>
          <span class="avatar">${esc(initials)}</span>
          <span><strong>${esc(t.name)}</strong><small>${esc(t.place)} · ${esc(t.puja)}</small></span>
        </figcaption>
      </figure>`;
      })
      .join("");
  }

  /* ---------------- Render: footer + contact details ---------------- */
  function renderSiteInfo() {
    $("#footerPujas").innerHTML = PUJAS.slice(0, 7)
      .map((p) => `<li><a href="#pujas" data-details="${esc(p.id)}">${esc(p.name)}</a></li>`)
      .join("");

    $$("[data-phone]").forEach((a) => { a.href = `tel:${SITE.phoneLink}`; a.textContent = SITE.phoneDisplay; });
    $$("[data-email]").forEach((a) => { a.href = `mailto:${SITE.email}`; a.textContent = SITE.email; });
    $$("[data-address]").forEach((el) => (el.textContent = SITE.address));
    $$("[data-hours]").forEach((el) => (el.textContent = SITE.hours));
    $$("[data-whatsapp]").forEach((a) => { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-social]").forEach((a) => (a.href = SITE.social[a.dataset.social] || "#"));
    $("#year").textContent = new Date().getFullYear();

    $("#pujaSelect").innerHTML =
      `<option value="">Select a puja</option>` +
      PUJAS.map((p) => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join("") +
      `<option value="Not sure – please guide me">Not sure – please guide me</option>`;
  }

  /* ---------------- Category filter ---------------- */
  function initFilters() {
    $$(".filters .chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        $$(".filters .chip").forEach((c) => { c.classList.remove("active"); c.setAttribute("aria-selected", "false"); });
        chip.classList.add("active");
        chip.setAttribute("aria-selected", "true");
        const f = chip.dataset.filter;
        $$("#pujaGrid .puja-card").forEach((card) => {
          card.hidden = f !== "all" && card.dataset.type !== f;
        });
      })
    );
  }

  /* ---------------- Modals ---------------- */
  let lastFocus = null;
  let returnTo = null; // modal to go back to when the current one is closed

  function openModal(modal) {
    $$(".modal").forEach((m) => { if (m !== modal) m.hidden = true; });
    lastFocus = lastFocus || document.activeElement;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    const first = modal.querySelector("input, select, .btn, .modal-close");
    if (first) setTimeout(() => first.focus(), 30);
  }

  function closeModals(all) {
    if (returnTo && !all) {
      // Enquiry was opened from a puja's details: go back to the details
      const back = returnTo;
      returnTo = null;
      $$(".modal").forEach((m) => (m.hidden = m !== back));
      const btn = back.querySelector("#detailsEnquire");
      if (btn) setTimeout(() => btn.focus({ preventScroll: true }), 30);
      return;
    }
    returnTo = null;
    $$(".modal").forEach((m) => (m.hidden = true));
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function openDetails(id) {
    const p = findPuja(id);
    if (!p) return;
    $("#detailsMedia").outerHTML = media(p, "details-media").replace('class="media', 'id="detailsMedia" class="media');
    $("#detailsType").textContent = TYPE_LABEL[p.type] || "Puja";
    $("#detailsTitle").textContent = p.name;
    $("#detailsDesc").textContent = p.description;
    $("#detailsDuration").textContent = p.duration;
    $("#detailsIdeal").textContent = p.idealFor;
    $("#detailsBenefits").innerHTML = p.benefits.map((b) => `<li>${icon("check")}${esc(b)}</li>`).join("");
    $("#detailsEnquire").onclick = () => {
      returnTo = $("#detailsModal");
      openEnquiry(p.id);
    };
    $("#detailsWhatsapp").href = waLink(`Namaste, I would like to enquire about ${p.name}.`);
    $("#detailsBook").innerHTML =
      (p.modes || []).map((m) =>
        `<a class="btn btn-primary" href="book.html?mode=${m}&puja=${encodeURIComponent(p.id)}">${icon(m === "online" ? "video" : "home")} ${m === "online" ? "Book Online" : "Book at Home"}</a>`
      ).join("") +
      `<a class="btn btn-link" href="puja.html?id=${encodeURIComponent(p.id)}">Full details &amp; prices ${icon("arrow")}</a>`;
    returnTo = null;
    openModal($("#detailsModal"));
    $("#detailsModal .modal-panel").scrollTop = 0;
  }

  function openEnquiry(pujaId) {
    const form = $("#enquiryForm");
    $("#enquiryFormWrap").hidden = false;
    $("#formSuccess").hidden = true;
    $("#formError").hidden = true;
    const p = pujaId && findPuja(pujaId);
    if (p) form.puja.value = p.name;
    openModal($("#enquiryModal"));
  }

  /* ---------------- Enquiry form ----------------
     No server is needed: the enquiry is sent to you through WhatsApp or
     email with all the details pre-filled. (To collect enquiries on a
     server instead, see README.md.) */
  function initForm() {
    const form = $("#enquiryForm");
    let channel = "whatsapp";
    $$("[data-send]", form).forEach((b) => b.addEventListener("click", () => (channel = b.dataset.send)));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      const phoneOk = /^[0-9+\s-]{10,15}$/.test((d.phone || "").trim());
      const ok = d.name.trim() && phoneOk && d.puja && d.city.trim();
      $$("input[required], select[required]", form).forEach((el) =>
        el.classList.toggle("invalid", !el.value.trim() || (el.name === "phone" && !phoneOk))
      );
      if (!ok) { $("#formError").hidden = false; return; }
      $("#formError").hidden = true;

      const lines = [
        "Namaste Agni Puja, I would like to enquire about a puja.",
        "",
        `Name: ${d.name.trim()}`,
        `Phone: ${d.phone.trim()}`,
        `Puja: ${d.puja}`,
        d.date ? `Preferred date: ${d.date}` : "",
        `City: ${d.city.trim()}`,
        d.email ? `Email: ${d.email.trim()}` : "",
        d.message ? `Message: ${d.message.trim()}` : ""
      ].filter((l, i) => l || i === 1);
      const text = lines.join("\n");

      if (channel === "email") {
        window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Puja enquiry – " + d.puja)}&body=${encodeURIComponent(text)}`;
      } else {
        window.open(waLink(text), "_blank", "noopener");
      }
      $("#enquiryFormWrap").hidden = true;
      $("#formSuccess").hidden = false;
      form.reset();
    });
  }

  /* ---------------- Global click handling ---------------- */
  function initClicks() {
    document.addEventListener("click", (e) => {
      const details = e.target.closest("[data-details]");
      const enquire = e.target.closest("[data-enquire]");
      const close = e.target.closest("[data-close]");
      if (details) { e.preventDefault(); openDetails(details.dataset.details); }
      else if (enquire) { e.preventDefault(); openEnquiry(enquire.dataset.enquire); closeMenu(); }
      else if (close) { closeModals(close.hasAttribute("data-close-all")); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModals(); closeMenu(); } });
  }

  /* ---------------- Header: mobile menu + active link ---------------- */
  const nav = $("#mainNav");
  const toggle = $("#menuToggle");
  function closeMenu() { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }

  function initHeader() {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));

    const header = $(".site-header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Highlight the nav link for the section in view
    const links = $$("a[href^='#']", nav);
    const ids = links.map((a) => a.getAttribute("href").slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
        }),
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => io.observe(s));
    }
  }

  renderPujas();
  renderHomams();
  renderOccasions();
  renderTestimonials();
  renderSiteInfo();
  initFilters();
  initForm();
  initClicks();
  initHeader();
})();
