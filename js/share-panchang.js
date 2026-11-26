/* =====================================================================
   AGNI PUJA – SHARE PANCHANG (admin)
   Makes a branded image and a WhatsApp message of the day's panchang,
   to send to a customer. Uses js/panchang.js for the calculations.
   ===================================================================== */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI, P = window.Panchang;
  const SITE = A.DATA.site;
  const { $, esc, icon } = U;

  /* ---------- Formatting ---------- */
  const ist = (jd, opts) => new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "Asia/Kolkata" }, opts)).format(new Date(P.msFromJd(jd)));
  const t = (jd) => ist(jd, { hour: "numeric", minute: "2-digit" });
  const dayOf = (jd) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(P.msFromJd(jd)));
  const range = (p) => { const a = t(p.start), b = t(p.end); return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`; };
  const longDate = (ymd) => new Date(ymd + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const shortDate = (ymd) => new Date(ymd + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const site = () => String(SITE.websiteUrl || location.origin + location.pathname.replace(/[^/]*$/, ""));
  const siteShort = () => site().replace(/^https?:\/\//, "").replace(/\/$/, "");

  function dataFor(ymd) {
    const loc = SITE.panchangLocation;
    const d = P.day(ymd, loc);
    const till = (jd) => !jd ? "" : `till ${t(jd)}${dayOf(jd) !== ymd ? ", " + ist(jd, { day: "numeric", month: "short" }) : ""}`;
    const special = d.specials[0] || (d.tamil.firstDay ? { name: `First day of ${d.tamil.month}`, note: "Tharpanam is offered on the first day of the Tamil month.", puja: "tharpanam" } : null);
    const c = d.chandrashtamam;
    return {
      ymd, d, loc, special,
      upcoming: P.upcoming(ymd, loc, 30).slice(0, 4),
      rows: [
        ["Tithi", d.tithi.name, d.tithi.end ? `${till(d.tithi.end)}, then ${d.tithi.next}` : ""],
        ["Nakshatram", d.nakshatra.name, till(d.nakshatra.end)],
        ["Yoga", d.yoga.name, till(d.yoga.end)],
        ["Sunrise · Sunset", `${t(d.sunrise)} · ${t(d.sunset)}`, ""],
        ["Rahu Kalam", range(d.rahu), ""],
        ["Yamagandam", range(d.yamagandam), ""],
        ["Gulika", range(d.gulika), ""]
      ],
      nalla: d.nallaNeram.map(range),
      chandra: `${c.rasi} (${c.stars.join(", ")})${c.end && c.next ? ` ${till(c.end)}, then ${c.next.rasi} (${c.next.stars.join(", ")})` : ""}`
    };
  }

  /* ---------- WhatsApp text ---------- */
  function shareText(x) {
    const d = x.d;
    const lines = [
      `🪔 *Today's Panchangam* – ${longDate(x.ymd)}`,
      `${d.tamil.month} ${d.tamil.day} · ${x.loc.name}`,
      "",
      `📅 *Tithi:* ${x.rows[0][1]}${x.rows[0][2] ? ` (${x.rows[0][2]})` : ""}`,
      `⭐ *Nakshatram:* ${x.rows[1][1]}${x.rows[1][2] ? ` (${x.rows[1][2]})` : ""}`,
      `🔱 *Yoga:* ${x.rows[2][1]}${x.rows[2][2] ? ` (${x.rows[2][2]})` : ""}`,
      `🌅 *Sunrise:* ${t(d.sunrise)}   🌇 *Sunset:* ${t(d.sunset)}`,
      `⛔ *Rahu Kalam:* ${x.rows[4][1]}`,
      `⚠️ *Yamagandam:* ${x.rows[5][1]}`,
      `⏳ *Gulika:* ${x.rows[6][1]}`,
      x.nalla.length ? `✅ *Nalla Neram:* ${x.nalla.join(", ")}` : "",
      `🌙 *Chandrashtamam:* ${x.chandra}`
    ];
    if (x.special) lines.push("", `🔔 *Today: ${x.special.name}* – ${x.special.note}`);
    if (x.upcoming.length) {
      lines.push("", "📌 *Coming up:*");
      x.upcoming.forEach((u) => lines.push(`• ${shortDate(u.date)} – ${u.name}`));
    }
    lines.push("", "🙏 Book a live online puja or a Pandit at your home:", site(), `📞 WhatsApp: ${SITE.phoneDisplay}`);
    return lines.filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i > 0)).join("\n");
  }

  /* ---------- Image ---------- */
  const W = 1080, H = 1350;
  const C = { maroon: "#6e1a24", maroonDark: "#4f1019", saffron: "#e2711d", saffronDark: "#c55a0c", gold: "#c9a44c", goldSoft: "#f3e6c4", cream: "#fdf8f0", cream2: "#f8efe2", ink: "#2b1d17", inkSoft: "#6b5a50", line: "#eadfce", green: "#17733b", greenBg: "#eaf6ee", amber: "#9a5a00", amberBg: "#fff3df" };
  const HEAD = '"Cormorant Garamond", Georgia, serif', BODY = 'Poppins, "Segoe UI", sans-serif';

  function wrap(ctx, text, maxW) {
    const words = String(text).split(" "), out = [];
    let line = "";
    words.forEach((w) => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
    });
    if (line) out.push(line);
    return out;
  }
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  async function drawImage(canvas, x) {
    try { await Promise.all([document.fonts.load(`700 60px ${HEAD}`), document.fonts.load(`500 30px ${BODY}`), document.fonts.load(`600 30px ${BODY}`)]); } catch (e) { /* fall back to system fonts */ }
    const logo = await loadImg("images/logo.svg");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const pad = 64, inner = W - pad * 2;

    // Background
    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);

    // Header band
    const hg = ctx.createLinearGradient(0, 0, W, 0);
    hg.addColorStop(0, C.maroonDark); hg.addColorStop(1, C.maroon);
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 190);
    ctx.fillStyle = C.gold; ctx.fillRect(0, 190, W, 6);
    if (logo) { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(pad + 48, 95, 52, 0, Math.PI * 2); ctx.fill(); ctx.drawImage(logo, pad + 6, 53, 84, 84); }
    ctx.fillStyle = "#fff"; ctx.font = `700 64px ${HEAD}`; ctx.textBaseline = "alphabetic";
    ctx.fillText(SITE.name || "Agni Puja", pad + 124, 100);
    ctx.fillStyle = C.gold; ctx.font = `600 22px ${BODY}`;
    ctx.fillText("ONLINE PUJA SERVICES", pad + 128, 138);
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = `600 26px ${BODY}`;
    ctx.fillText("Today's", W - pad, 88); ctx.font = `700 46px ${HEAD}`; ctx.fillStyle = C.gold;
    ctx.fillText("Panchangam", W - pad, 134); ctx.textAlign = "left";

    // Date
    let y = 270;
    ctx.fillStyle = C.maroon; ctx.font = `700 58px ${HEAD}`;
    ctx.fillText(longDate(x.ymd), pad, y);
    y += 46; ctx.fillStyle = C.saffronDark; ctx.font = `500 28px ${BODY}`;
    ctx.fillText(`${x.d.tamil.month} ${x.d.tamil.day}  ·  ${x.loc.name}`, pad, y);

    // Panchang rows
    y += 34;
    const rowH = 58, labelW = 290;
    x.rows.forEach(([label, value, sub], i) => {
      if (i % 2 === 0) roundRect(ctx, pad - 16, y, inner + 32, rowH, 14, C.cream2);
      ctx.fillStyle = C.inkSoft; ctx.font = `600 22px ${BODY}`;
      ctx.fillText(label.toUpperCase(), pad, y + 37);
      ctx.fillStyle = C.maroon; ctx.font = `600 29px ${BODY}`;
      ctx.fillText(value, pad + labelW, y + 37);
      if (sub) {
        const vw = ctx.measureText(value).width;
        ctx.fillStyle = C.inkSoft; ctx.font = `400 21px ${BODY}`;
        const s = wrap(ctx, sub, inner - labelW - vw - 24)[0];
        ctx.fillText(s, pad + labelW + vw + 16, y + 37);
      }
      y += rowH;
    });

    // Nalla Neram
    y += 18;
    // Break lines only between time ranges, never inside one
    const nallaLines = (() => {
      ctx.font = `600 28px ${BODY}`;
      const out = []; let line = "";
      (x.nalla.length ? x.nalla : ["—"]).forEach((r) => {
        const test = line ? line + "   ·   " + r : r;
        if (line && ctx.measureText(test).width > inner - 40) { out.push(line); line = r; } else line = test;
      });
      if (line) out.push(line);
      return out;
    })();
    const nh = 66 + nallaLines.length * 38;
    roundRect(ctx, pad - 16, y, inner + 32, nh, 16, C.greenBg, "#cfe9d7");
    ctx.fillStyle = C.green; ctx.font = `600 22px ${BODY}`; ctx.fillText("✓  NALLA NERAM", pad + 8, y + 40);
    ctx.font = `600 28px ${BODY}`;
    nallaLines.forEach((l, i) => ctx.fillText(l, pad + 8, y + 80 + i * 38));
    y += nh + 16;

    // Chandrashtamam
    ctx.font = `500 25px ${BODY}`;
    const chLines = wrap(ctx, x.chandra, inner - 20).slice(0, 3);
    const chH = 62 + chLines.length * 34;
    roundRect(ctx, pad - 16, y, inner + 32, chH, 16, C.amberBg, "#f2d7a6");
    ctx.fillStyle = C.amber; ctx.font = `600 22px ${BODY}`; ctx.fillText("CHANDRASHTAMAM", pad + 8, y + 40);
    ctx.fillStyle = C.ink; ctx.font = `500 25px ${BODY}`;
    chLines.forEach((l, i) => ctx.fillText(l, pad + 8, y + 76 + i * 34));
    y += chH + 22;

    // Today's special / coming up
    const footerTop = H - 150;
    if (x.special && y + 110 < footerTop) {
      roundRect(ctx, pad - 16, y, inner + 32, 96, 16, C.goldSoft, C.gold);
      ctx.fillStyle = C.maroon; ctx.font = `700 36px ${HEAD}`;
      ctx.fillText(`Today: ${x.special.name}`, pad + 8, y + 44);
      ctx.fillStyle = C.inkSoft; ctx.font = `400 22px ${BODY}`;
      ctx.fillText(wrap(ctx, x.special.note, inner - 20)[0], pad + 8, y + 78);
      y += 116;
    }
    if (x.upcoming.length && y + 80 < footerTop) {
      ctx.fillStyle = C.saffronDark; ctx.font = `600 22px ${BODY}`;
      ctx.fillText("COMING UP", pad, y + 26);
      y += 44;
      ctx.font = `500 24px ${BODY}`;
      let cx = pad;
      for (const u of x.upcoming) {
        const label = `${shortDate(u.date)}  ${u.name}`;
        const w = ctx.measureText(label).width + 36;
        if (cx + w > W - pad) { cx = pad; y += 54; }
        if (y + 44 > footerTop - 8) break;
        roundRect(ctx, cx, y, w, 44, 22, "#fff", C.line);
        ctx.fillStyle = C.ink; ctx.fillText(label, cx + 18, y + 30);
        cx += w + 12;
      }
    }

    // Footer
    const fg = ctx.createLinearGradient(0, footerTop, W, H);
    fg.addColorStop(0, C.saffron); fg.addColorStop(1, C.maroon);
    ctx.fillStyle = fg; ctx.fillRect(0, footerTop, W, H - footerTop);
    ctx.fillStyle = "#fff"; ctx.font = `600 28px ${BODY}`;
    ctx.fillText("Book a live online puja or a Pandit at home", pad, footerTop + 52);
    ctx.font = `600 30px ${BODY}`; ctx.fillStyle = "#fff4dc";
    ctx.fillText(siteShort(), pad, footerTop + 98);
    ctx.textAlign = "right"; ctx.font = `500 26px ${BODY}`; ctx.fillStyle = "#fff";
    ctx.fillText(`WhatsApp ${SITE.phoneDisplay}`, W - pad, footerTop + 98);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `400 18px ${BODY}`;
    ctx.fillText(`Timings for ${x.loc.name}. Please confirm with our Pandit for important muhurtham.`, pad, footerTop + 132);
  }

  const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, "image/png"));

  /* ---------- Page ---------- */
  function mount(root, ymd) {
    const x = dataFor(ymd);
    const text = shareText(x);
    root.innerHTML = `
      <div class="share-layout">
        <div class="share-preview"><canvas id="shareCanvas" aria-label="Panchang image preview"></canvas></div>
        <div class="share-side">
          <div class="panel">
            <h3>Panchang for ${esc(longDate(ymd))}</h3>
            <div class="pg-controls" style="margin:0 0 14px">
              <button type="button" class="icon-btn" data-sh-step="-1" aria-label="Previous day">${icon("back")}</button>
              <input type="date" class="input" value="${ymd}" data-sh-date aria-label="Choose a date">
              <button type="button" class="icon-btn" data-sh-step="1" aria-label="Next day">${icon("arrow")}</button>
              <button type="button" class="btn btn-link btn-sm" data-sh-today>Today</button>
            </div>
            <div class="share-actions">
              <button type="button" class="btn btn-whatsapp" data-sh-share disabled>${icon("whatsapp")} Preparing image…</button>
              <button type="button" class="btn btn-outline" data-sh-download>Download image</button>
              <button type="button" class="btn btn-outline" data-sh-copy>Copy text</button>
              <a class="btn btn-soft" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${icon("whatsapp")} Send text only</a>
            </div>
            <p class="hint" style="margin-top:10px" data-sh-hint></p>
            <label class="field" style="margin-top:14px">WhatsApp message
              <textarea class="input" rows="16" data-sh-text>${esc(text)}</textarea>
            </label>
          </div>
        </div>
      </div>`;

    const canvas = $("#shareCanvas", root);
    const fileName = `agni-puja-panchang-${ymd}.png`;
    const shareBtn = $("[data-sh-share]", root), hint = $("[data-sh-hint]", root);
    // Prepare the image file as soon as it is drawn, so tapping Share can
    // open the share menu straight away (phones only allow sharing right
    // after a tap).
    let file = null, canShareFile = false;
    drawImage(canvas, x).then(() => toBlob(canvas)).then((blob) => {
      file = new File([blob], fileName, { type: "image/png" });
      try { canShareFile = !!(navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { canShareFile = false; }
      shareBtn.disabled = false;
      shareBtn.innerHTML = `${icon("whatsapp")} ${canShareFile ? "Share on WhatsApp" : "Download image + open WhatsApp"}`;
      hint.innerHTML = `${icon("info")} ${canShareFile
        ? "Tap <strong>Share on WhatsApp</strong>, choose <strong>WhatsApp</strong> in the menu, then the customer. The image and message are sent together."
        : "This browser can't attach images to WhatsApp directly. The image is downloaded and WhatsApp opens with the message – choose the customer, then attach the downloaded image (📎 → Gallery or Document)."}`;
    });
    const go = (d) => mount(root, d);
    root.querySelectorAll("[data-sh-step]").forEach((b) => b.addEventListener("click", () => go(P.addDays(ymd, +b.dataset.shStep))));
    $("[data-sh-date]", root).addEventListener("change", (e) => e.target.value && go(e.target.value));
    $("[data-sh-today]", root).addEventListener("click", () => go(A.istToday()));
    const currentText = () => $("[data-sh-text]", root).value;
    const download = (blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = fileName;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    };
    // Download the image and open WhatsApp with the message (no awaits before
    // window.open, so the browser doesn't block it as a pop-up)
    const downloadAndOpenWhatsApp = () => {
      download(file);
      window.open("https://wa.me/?text=" + encodeURIComponent(currentText()), "_blank", "noopener");
      U.toast("Image downloaded. In WhatsApp, choose the customer and attach the image.", "info", 7000);
    };

    $("[data-sh-download]", root).addEventListener("click", async () => download(file || await toBlob(canvas)));
    $("[data-sh-copy]", root).addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(currentText()); U.toast("Text copied. Paste it in WhatsApp."); }
      catch (e) { const ta = $("[data-sh-text]", root); ta.select(); document.execCommand("copy"); U.toast("Text copied."); }
    });
    shareBtn.addEventListener("click", () => {
      if (!file) return;
      if (!canShareFile) { downloadAndOpenWhatsApp(); return; }
      // Called straight from the tap – nothing is awaited before share()
      navigator.share({ files: [file], text: currentText() }).catch((e) => {
        if (e && e.name === "AbortError") return; // closed the share menu
        U.toast("Couldn't open the share menu – downloading the image and opening WhatsApp instead.", "info", 6000);
        downloadAndOpenWhatsApp();
      });
    });
  }

  window.AgniShare = { mount, dataFor, shareText };
})();
