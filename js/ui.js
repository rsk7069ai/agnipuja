/* =====================================================================
   AGNI PUJA – SHARED PAGE HELPERS
   Header, footer, icons, account menu, toasts, popups and the time-slot
   picker used by the booking, NRI, dashboard and admin pages. On the
   homepage it only adds the account button and any missing icons.
   ===================================================================== */
(function () {
  "use strict";

  const A = window.Agni;
  const SITE = A.DATA.site;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const money = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
  // Prices can be switched off in js/pujas-data.js (site.showPrices)
  const showPrices = SITE.showPrices !== false;
  if (!showPrices && !/admin\.html$/.test(location.pathname)) document.documentElement.classList.add("hide-prices");
  function approx(n, code) {
    const co = A.country(code);
    if (!co || co.code === "IN") return "";
    const v = n * co.rate;
    return "≈ " + new Intl.NumberFormat("en", { style: "currency", currency: co.currency, maximumFractionDigits: v < 100 ? 2 : 0 }).format(v);
  }
  const waLink = (text, number) =>
    `https://wa.me/${number || SITE.whatsapp}?text=${encodeURIComponent(text || "Namaste, I would like to enquire about a puja.")}`;
  const qs = (name) => new URLSearchParams(location.search).get(name);
  const here = () => location.pathname.split("/").pop() + location.search + location.hash;
  const media = (p, cls = "") =>
    `<div class="media ${cls}">${icon("flame")}${p && p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : ""}</div>`;

  /* ---------------- Icons (adds any symbols missing from the page) ---------------- */
  const SPRITE = `
<symbol id="i-flame" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c.6 3.2-1.4 4.9-2.9 6.6C7.6 10.2 6 12 6 14.8 6 18.2 8.7 21 12 21s6-2.8 6-6.2c0-2.4-1-4.1-2.3-5.6-.2 1.5-.9 2.6-2 3.2.4-3.6-.6-7.2-1.7-9.4Zm0 17c-1.7 0-3-1.3-3-3 0-1.4.9-2.3 1.8-3.3.4 1 1.200 1.7 2.2 1.9.1-.6.5-1.2 1-1.6.6.8 1 1.8 1 3 0 1.7-1.3 3-3 3Z"/></symbol>
<symbol id="i-whatsapp" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.500-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.200-.1-.1-.3-.2-.6-.3Z"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.5l8 5 8-5V6H4Zm16 2.8-8 5-8-5V18h16V8.8Z"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7Z"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path fill="currentColor" d="M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3 1.4-1.4Z"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path fill="currentColor" d="M10.8 5.3 4.1 12l6.7 6.7 1.4-1.4-4.3-4.3H20v-2H7.9l4.3-4.3-1.400-1.4Z"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path fill="currentColor" d="m9.5 16.2-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z" transform="translate(.7)"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></symbol>
<symbol id="i-priest" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2.2 8 5v3H4v-3c0-2.8 3.6-5 8-5Zm-1 3v3h2v-3h-2Z"/></symbol>
<symbol id="i-scroll" viewBox="0 0 24 24"><path fill="currentColor" d="M6 3h11a3 3 0 0 1 3 3v1h-3V6a1 1 0 0 0-1-1H9.8c.1.3.2.6.2 1v12a1 1 0 0 0 2 0v-2h9v2a4 4 0 0 1-4 4H8a3 3 0 0 1-3-3V7H3V6a3 3 0 0 1 3-3Zm6 6h5v2h-5V9Zm0 3h5v2h-5v-2Z"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.300 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.8-4.8 1.4 1.4-6.2 6.2Z"/></symbol>
<symbol id="i-calendar" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2Zm12 8H5v9h14v-9Zm-8 2h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-8 0h2v2H7v-2Z"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2 0 3.4 1.1 4.3 2.4.9-1.3 2.3-2.4 4.3-2.4 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21Z"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 2 11.5l1.3 1.5L5 11.6V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-8.4l1.7 1.4 1.3-1.5L12 3Z"/></symbol>
<symbol id="i-diya" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c.9 1.6 2 2.9 2 4.6a2 2 0 0 1-4 0C10 4.9 11.1 3.6 12 2ZM2 12h20c0 4-4 7-10 7S2 16 2 12Zm4 8h12v2H6v-2Z"/></symbol>
<symbol id="i-family" viewBox="0 0 24 24"><path fill="currentColor" d="M7 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm10 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM4 10h6l-1 6v5H5v-5l-1-6Zm10 0h6l-1 6h-1v5h-2v-5h-1l-1-6Zm-2 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-1.5 5h3v3h-3v-3Z"/></symbol>
<symbol id="i-facebook" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.6V13h2.8v8h3.1Z"/></symbol>
<symbol id="i-instagram" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8c0-1.6-.4-3-1.6-4.2C18.2 2.6 16.8 2.2 15.2 2.1H8.8C7.2 2.2 5.8 2.6 4.6 3.8 3.4 5 3 6.4 3 8v8c0 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.6 4.2 1.7h6.4c1.6-.1 3-.5 4.2-1.7 1.2-1.2 1.6-2.6 1.6-4.2V8Z"/></symbol>
<symbol id="i-youtube" viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/></symbol>
<symbol id="i-video" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3.5l4-3v11l-4-3V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8ZM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4ZM4.3 14a8 8 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3c.3 1.3.8 2.5 1.4 3.6A8 8 0 0 1 5.1 16ZM8.1 8h-3a8 8 0 0 1 4.4-3.6C8.9 5.5 8.4 6.7 8.1 8ZM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.2 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6Zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8 8 0 0 1 0 4h-3.4Z"/></symbol>
<symbol id="i-truck" viewBox="0 0 24 24"><path fill="currentColor" d="M2 5h12v9h1V8h4l3 4v5h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2V5Zm4 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-1-8v2h4l-1.5-2H16Z"/></symbol>
<symbol id="i-logout" viewBox="0 0 24 24"><path fill="currentColor" d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3Zm6.6 4.6-1.4 1.4 2 2H9v2h8.2l-2 2 1.4 1.4L21 12l-4.4-4.4Z"/></symbol>
<symbol id="i-lock" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a2 2 0 0 0-1 3.7V19h2v-1.3a2 2 0 0 0-1-3.7Z"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 4h16V7H4v2Zm0 3v5h16v-5H4Zm2 2h5v2H6v-2Z"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.8V3a1.5 1.5 0 0 0-3 0v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"/></symbol>
<symbol id="i-chart" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20V10h3v10H4Zm6.5 0V4h3v16h-3ZM17 20v-7h3v7h-3Z"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><path fill="currentColor" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM1 20c0-3.3 3.6-6 8-6s8 2.7 8 6v1H1v-1Zm17.3 1H23v-1c0-2.6-2.4-4.7-5.800-5.6 1.3 1.3 2.1 2.8 2.1 4.6v2Z"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2ZM6 9h12l-1 12H7L6 9Zm4 2v8h1.5v-8H10Zm2.5 0v8H14v-8h-1.5Z"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24"><path fill="currentColor" d="M4 17.2V20h2.8L17 9.8 14.2 7 4 17.2ZM19.7 7.1a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0L15.6 5.6l2.8 2.8 1.3-1.3Z"/></symbol>
<symbol id="i-info" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></symbol>
<symbol id="i-refresh" viewBox="0 0 24 24"><path fill="currentColor" d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.2L13 11h7V4l-2.3 2.3Z"/></symbol>
<symbol id="i-gift" viewBox="0 0 24 24"><path fill="currentColor" d="M20 7h-2.2A3 3 0 0 0 12 4a3 3 0 0 0-5.8 3H4a1 1 0 0 0-1 1v3h8V7h2v4h8V8a1 1 0 0 0-1-1ZM9 7a1 1 0 1 1 1-1v1H9Zm6 0h-1V6a1 1 0 1 1 1 1ZM4 13v7a1 1 0 0 0 1 1h6v-8H4Zm9 8h6a1 1 0 0 0 1-1v-7h-7v8Z"/></symbol>`;

  function injectIcons() {
    const tpl = document.createElement("template");
    tpl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${SPRITE}</svg>`;
    const missing = Array.from(tpl.content.querySelectorAll("symbol")).filter((s) => !document.getElementById(s.id));
    if (!missing.length) return;
    const holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    holder.setAttribute("width", "0"); holder.setAttribute("height", "0");
    holder.setAttribute("aria-hidden", "true"); holder.style.position = "absolute";
    missing.forEach((s) => holder.appendChild(s));
    document.body.prepend(holder);
  }

  /* ---------------- Header & footer for inner pages ---------------- */
  const NAV = [
    ["index.html#home", "Home", "home"],
    ["book.html?mode=online", "Online Puja", "online"],
    ["book.html?mode=home", "Pandit at Home", "home-booking"],
    ["nri.html", "NRI Puja", "nri"],
    ["index.html#pujas", "All Pujas", "pujas"],
    ["index.html#contact", "Contact", "contact"]
  ];

  function headerHtml(active) {
    return `
  <header class="site-header" id="top">
    <div class="container header-inner">
      <a href="index.html" class="brand" aria-label="Agni Puja home">
        <img src="images/logo.svg" alt="" width="40" height="40">
        <span class="brand-text"><span class="brand-name">Agni Puja</span><span class="brand-tag">Online Puja Services</span></span>
      </a>
      <nav class="main-nav" id="mainNav" aria-label="Main">
        ${NAV.map(([href, label, key]) => `<a href="${href}"${key === active ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("")}
        <a class="btn btn-primary nav-cta-mobile" href="book.html">Book a Puja</a>
      </nav>
      <div class="header-actions">
        <a class="btn btn-primary header-cta" href="book.html">Book a Puja</a>
        <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav"><svg><use href="#i-menu"/></svg></button>
      </div>
    </div>
  </header>`;
  }

  function footerHtml() {
    return `
  <footer class="site-footer" id="contact">
    <div class="container footer-grid">
      <div class="footer-col footer-about">
        <a href="index.html" class="brand brand-footer">
          <img src="images/logo.svg" alt="" width="40" height="40">
          <span class="brand-text"><span class="brand-name">Agni Puja</span><span class="brand-tag">Online Puja Services</span></span>
        </a>
        <p>Trusted Vedic priests for pujas, homams and family ceremonies – live online anywhere in the world, or at your home.</p>
        <div class="social">
          <a href="${esc(SITE.social.facebook)}" aria-label="Facebook" target="_blank" rel="noopener">${icon("facebook")}</a>
          <a href="${esc(SITE.social.instagram)}" aria-label="Instagram" target="_blank" rel="noopener">${icon("instagram")}</a>
          <a href="${esc(SITE.social.youtube)}" aria-label="YouTube" target="_blank" rel="noopener">${icon("youtube")}</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Book</h4>
        <ul>
          <li><a href="book.html?mode=online">Online Puja</a></li>
          <li><a href="book.html?mode=home">Pandit at Home</a></li>
          <li><a href="nri.html">NRI Online Puja</a></li>
          <li><a href="track.html">Track Booking</a></li>
          <li><a href="index.html#faq">FAQs</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Puja Categories</h4>
        <ul>${A.pujas().slice(0, 7).map((p) => `<li><a href="puja.html?id=${esc(p.id)}">${esc(p.name)}</a></li>`).join("")}</ul>
      </div>
      <div class="footer-col">
        <h4>Contact Us</h4>
        <ul class="contact-list">
          <li>${icon("phone")}<a href="tel:${esc(SITE.phoneLink)}">${esc(SITE.phoneDisplay)}</a></li>
          <li>${icon("mail")}<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>
          <li>${icon("pin")}<span>${esc(SITE.address)}</span></li>
          <li>${icon("clock")}<span>${esc(SITE.hours)}</span></li>
        </ul>
        <a class="btn btn-whatsapp" href="${waLink()}" target="_blank" rel="noopener">${icon("whatsapp")} Chat on WhatsApp</a>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© ${new Date().getFullYear()} Agni Puja. All rights reserved.</p>
        <p>Made with devotion in India · <a href="admin.html">Admin</a> · <a href="images/CREDITS.md" target="_blank" rel="noopener">Photo credits</a></p>
      </div>
    </div>
  </footer>
  <a class="whatsapp-float" href="${waLink()}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${icon("whatsapp")}</a>`;
  }

  function initMenu() {
    const nav = $("#mainNav"), toggle = $("#menuToggle");
    if (!nav || !toggle) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
    const header = $(".site-header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Account button (all pages) ---------------- */
  const initials = (name) => (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function mountAccount() {
    const actions = $(".header-actions");
    if (!actions) return;
    const old = $(".account", actions);
    if (old) old.remove();
    // Customer login is switched off for now: customers book without an
    // account and check their booking on track.html (booking ID + phone).
    const u = null;
    const wrap = document.createElement("div");
    wrap.className = "account";
    if (!u) {
      wrap.innerHTML = `<a class="account-btn" href="track.html">${icon("calendar")}<span>Track Booking</span></a>`;
    } else {
      wrap.innerHTML = `
        <button class="account-btn" aria-haspopup="true" aria-expanded="false"><span class="avatar avatar-sm">${esc(initials(u.name || u.email || "U"))}</span><span>${esc((u.name || "My Account").split(" ")[0])}</span></button>
        <div class="account-menu" hidden>
          <p class="account-who"><strong>${esc(u.name || "Welcome")}</strong><small>${esc(u.email || u.phone)}</small></p>
          <a href="dashboard.html#bookings">${icon("calendar")} My Bookings</a>
          <a href="dashboard.html#profile">${icon("user")} My Profile</a>
          <a href="book.html">${icon("flame")} Book a Puja</a>
          <button type="button" data-logout>${icon("logout")} Log out</button>
        </div>`;
      const btn = $(".account-btn", wrap), menu = $(".account-menu", wrap);
      btn.addEventListener("click", (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute("aria-expanded", String(!menu.hidden)); });
      document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); } });
      $("[data-logout]", wrap).addEventListener("click", () => { A.signOut(); location.href = "index.html"; });
    }
    actions.prepend(wrap);
  }

  /* ---------------- Toasts ---------------- */
  function toast(msg, type = "info", ms = 4200) {
    let box = $("#toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; box.className = "toasts"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast toast-" + type;
    t.innerHTML = `${icon(type === "error" ? "info" : type === "sms" ? "phone" : "check")}<div>${msg}</div>`;
    box.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms);
  }

  /* ---------------- Popup (reuses the homepage modal styles) ---------------- */
  function modal(html, { wide } = {}) {
    const el = document.createElement("div");
    el.className = "modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML = `<div class="modal-backdrop" data-x></div>
      <div class="modal-panel modal-form${wide ? " modal-wide" : ""}">
        <button class="modal-close" data-x aria-label="Close">${icon("close")}</button>${html}</div>`;
    const prev = document.activeElement;
    const close = () => { el.remove(); document.removeEventListener("keydown", onKey); if (!$(".modal:not([hidden])")) document.body.classList.remove("no-scroll"); if (prev && prev.focus) prev.focus(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    el.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(el);
    document.body.classList.add("no-scroll");
    const first = el.querySelector("input, select, textarea, .btn");
    if (first) setTimeout(() => first.focus(), 40);
    return { el, close };
  }

  function confirmBox(title, text, okLabel = "Confirm", danger) {
    return new Promise((resolve) => {
      const m = modal(`<h3>${esc(title)}</h3><p class="modal-intro">${text}</p>
        <div class="form-actions"><button class="btn btn-outline" data-no>Go back</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-yes>${esc(okLabel)}</button></div>`);
      m.el.addEventListener("click", (e) => {
        if (e.target.closest("[data-yes]")) { m.close(); resolve(true); }
        else if (e.target.closest("[data-no]") || e.target.closest("[data-x]")) { m.close(); resolve(false); }
      });
    });
  }

  /* ---------------- Time-slot picker ----------------
     Renders a date input + slot buttons, based on real Pandit availability. */
  function slotPicker(root, opts) {
    const st = { date: opts.date || "", slot: opts.slot || "" };
    const B = A.DATA.booking;
    const min = A.istToday(), max = A.addDays(min, B.maxDaysAhead);

    function render() {
      const tz = opts.tz && opts.tz() || "Asia/Kolkata";
      const showLocal = tz !== "Asia/Kolkata";
      const mode = opts.mode(), cityName = opts.city ? opts.city() : "";
      if (!st.date) {
        const open = A.nextOpenDates({ mode, city: cityName, count: 1 });
        st.date = open[0] || A.addDays(min, 1);
      }
      const slots = A.availability({ date: st.date, mode, city: cityName, ignoreId: opts.ignoreId });
      if (st.slot && !slots.some((s) => s.slot === st.slot && s.available)) st.slot = "";
      const quick = A.nextOpenDates({ mode, city: cityName, count: 6 });
      const anyFree = slots.some((s) => s.available);
      root.innerHTML = `
        <div class="date-row">
          <label class="field">Puja date
            <input type="date" class="input" value="${st.date}" min="${min}" max="${max}" data-date>
          </label>
          <div class="quick-dates" aria-label="Next available dates">
            ${quick.map((d) => `<button type="button" class="chip${d === st.date ? " active" : ""}" data-quick="${d}">${A.fmtDay(d)}</button>`).join("")}
          </div>
        </div>
        ${showLocal ? `<p class="hint">${icon("globe")} Times are shown in <strong>your local time</strong> (${esc(tz.split("/").pop().replace(/_/g, " "))}) with Indian time (IST) below. Slots marked <span class="badge badge-gold">Good time</span> fall between 6 AM and 10 PM for you.</p>` : ""}
        <div class="slot-grid" role="radiogroup" aria-label="Available time slots">
          ${slots.map((s) => {
            const localDay = showLocal && A.localDateKey(st.date, s.slot, tz) !== st.date ? `<small>${A.fmtDay(A.localDateKey(st.date, s.slot, tz))}</small>` : "";
            const h = showLocal ? A.localHour(st.date, s.slot, tz) : 12;
            const good = showLocal && s.available && h >= 6 && h < 22;
            return `<button type="button" role="radio" aria-checked="${s.slot === st.slot}" class="slot${s.slot === st.slot ? " selected" : ""}" data-slot="${s.slot}" ${s.available ? "" : "disabled"}>
              <strong>${A.fmtTime(st.date, s.slot, tz)}</strong>${localDay}
              ${showLocal ? `<small>${A.fmtTime(st.date, s.slot)} IST</small>` : ""}
              <span class="slot-status">${s.available ? "Available" : s.reason === "notice" ? "Too soon" : s.reason === "city" ? "—" : "Fully booked"}</span>
              ${good ? `<span class="badge badge-gold">Good time</span>` : ""}
            </button>`;
          }).join("")}
        </div>
        ${anyFree ? "" : `<p class="notice notice-warn">${icon("info")} No Pandit is free on this date${mode === "home" ? " in " + esc(cityName || "this city") : ""}. Please choose another date${quick.length ? " – the next available dates are shown above" : ""}.</p>`}`;
      $("[data-date]", root).addEventListener("change", (e) => { st.date = e.target.value; st.slot = ""; render(); opts.onChange && opts.onChange(st); });
      $$("[data-quick]", root).forEach((b) => b.addEventListener("click", () => { st.date = b.dataset.quick; st.slot = ""; render(); opts.onChange && opts.onChange(st); }));
      $$("[data-slot]", root).forEach((b) => b.addEventListener("click", () => { st.slot = b.dataset.slot; render(); opts.onChange && opts.onChange(st); }));
    }
    render();
    return { state: st, render };
  }

  /* ---------------- Misc ---------------- */
  const STATUS = {
    pending: ["Pending confirmation", "badge-gold"], confirmed: ["Confirmed", "badge-green"], completed: ["Completed", "badge-maroon"], cancelled: ["Cancelled", "badge-red"]
  };
  const statusBadge = (s) => { const [l, c] = STATUS[s] || [s, ""]; return `<span class="badge ${c}">${esc(l)}</span>`; };
  const modeBadge = (m) => m === "online"
    ? `<span class="badge badge-saffron">${icon("video")} Online</span>`
    : `<span class="badge badge-gold">${icon("home")} At home</span>`;

  function icsFor(b) {
    const start = A.istToDate(b.date, b.slot);
    const end = new Date(start.getTime() + 2 * 3600000);
    const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const loc = b.mode === "online" ? b.meetingLink : A.fmtAddress(b.address);
    const body = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Agni Puja//Booking//EN", "BEGIN:VEVENT",
      `UID:${b.id}@agnipuja`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
      `SUMMARY:${b.pujaName} (${b.mode === "online" ? "Online puja" : "Pandit at home"})`,
      `LOCATION:${String(loc || "").replace(/[,;]/g, " ")}`,
      `DESCRIPTION:Booking ${b.id}${b.meetingLink ? " - Join: " + b.meetingLink : ""}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
  }

  window.AgniUI = {
    $, $$, esc, icon, money, approx, showPrices, waLink, qs, here, media, toast, modal, confirmBox, slotPicker,
    statusBadge, modeBadge, icsFor, initials, mountAccount,
    requireLogin() {
      if (A.currentUser()) return A.currentUser();
      location.replace("track.html");
      return null;
    }
  };

  /* ---------------- Boot ---------------- */
  injectIcons();
  const headerSlot = $("#siteHeader");
  if (headerSlot) { headerSlot.outerHTML = headerHtml(document.body.dataset.nav || ""); initMenu(); }
  const footerSlot = $("#siteFooter");
  if (footerSlot) footerSlot.outerHTML = footerHtml();
  mountAccount();
})();
