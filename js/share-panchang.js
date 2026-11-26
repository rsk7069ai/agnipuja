/* =====================================================================
   AGNI PUJA – SHARE PANCHANG (admin)
   Makes a branded image and a WhatsApp message of the day's panchang,
   in English or Tamil, to send to a customer. Uses js/panchang.js.
   ===================================================================== */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI, P = window.Panchang;
  const SITE = A.DATA.site;
  const { $, esc, icon } = U;

  /* ---------- Words in each language ---------- */
  const TA = {
    weekday: ["ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"],
    weekdayShort: ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"],
    month: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
    monthShort: ["ஜன.", "பிப்.", "மார்ச்", "ஏப்.", "மே", "ஜூன்", "ஜூலை", "ஆக.", "செப்.", "அக்.", "நவ.", "டிச."],
    tamilMonth: ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"],
    tithi: ["பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி"],
    star: ["அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"],
    yoga: ["விஷ்கம்பம்", "ப்ரீதி", "ஆயுஷ்மான்", "சௌபாக்கியம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்", "திருதி", "சூலம்", "கண்டம்", "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி", "வியதீபாதம்", "வரியான்", "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்", "சுக்லம்", "பிரம்மம்", "இந்திரம்", "வைதிருதி"],
    rasi: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
    special: {
      amavasya: ["அமாவாசை", "முன்னோர்களுக்கு தர்ப்பணம் செய்ய உகந்த புனித நாள்."],
      pournami: ["பௌர்ணமி", "சத்யநாராயண பூஜை செய்ய உகந்த நாள்."],
      ekadashi: ["ஏகாதசி", "பெருமாளை வழிபட்டு விரதம் இருக்கும் நாள்."],
      pradosham: ["பிரதோஷம்", "மாலையில் சிவபெருமானை வழிபட உகந்த நாள்."],
      sankatahara: ["சங்கடஹர சதுர்த்தி", "விநாயகப் பெருமானை வழிபட உகந்த நாள்."],
      shashti: ["சஷ்டி", "முருகப் பெருமானை வழிபட உகந்த நாள்."],
      month: ["{m} மாதப் பிறப்பு", "தமிழ் மாதப் பிறப்பு – தர்ப்பணம் செய்யும் நாள்."]
    },
    label: {
      title: "இன்றைய பஞ்சாங்கம்", today: "இன்றைய", panchangam: "பஞ்சாங்கம்", tagline: "ஆன்லைன் பூஜை சேவைகள்",
      tithi: "திதி", nakshatram: "நட்சத்திரம்", yoga: "யோகம்", sun: "உதயம் · அஸ்தமனம்", sunrise: "சூரிய உதயம்", sunset: "அஸ்தமனம்",
      rahu: "ராகு காலம்", yama: "எமகண்டம்", gulika: "குளிகை", nalla: "நல்ல நேரம்", chandra: "சந்திராஷ்டமம்",
      todaySpecial: "இன்று", coming: "வரவிருக்கும் சிறப்பு நாட்கள்",
      book: "ஆன்லைன் பூஜை அல்லது வீட்டிற்கே பண்டிதர் – முன்பதிவு செய்ய:",
      bookShort: "ஆன்லைன் பூஜை / வீட்டிற்கே பண்டிதர் – முன்பதிவு செய்ய",
      note: "நேரங்கள் {city}க்கானவை. முக்கிய முகூர்த்தங்களுக்கு எங்கள் பண்டிதரிடம் உறுதிசெய்யவும்.",
      city: "சென்னை"
    }
  };

  /* ---------- Time & date formatting ---------- */
  const istParts = (jd) => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(P.msFromJd(jd)));
    const g = (k) => +p.find((x) => x.type === k).value;
    return { h: g("hour") % 24, m: g("minute") };
  };
  // Tamil time of day: காலை 7:38, மதியம் 1:22, மாலை 4:13, இரவு 8:05
  const taPeriod = (h) => h < 4 ? "இரவு" : h < 6 ? "அதிகாலை" : h < 12 ? "காலை" : h < 16 ? "மதியம்" : h < 19 ? "மாலை" : "இரவு";
  const clock12 = (h, m) => `${h % 12 || 12}:${String(m).padStart(2, "0")}`;

  function fmt(lang) {
    const ta = lang === "ta";
    const t = (jd) => {
      if (!ta) return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(new Date(P.msFromJd(jd)));
      const { h, m } = istParts(jd);
      return `${taPeriod(h)} ${clock12(h, m)}`;
    };
    const range = (p) => {
      if (!ta) { const a = t(p.start), b = t(p.end); return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`; }
      const s = istParts(p.start), e = istParts(p.end);
      return taPeriod(s.h) === taPeriod(e.h) ? `${taPeriod(s.h)} ${clock12(s.h, s.m)} – ${clock12(e.h, e.m)}` : `${t(p.start)} – ${t(p.end)}`;
    };
    const ymdParts = (ymd) => { const [y, mo, d] = ymd.split("-").map(Number); return { y, mo: mo - 1, d, wd: new Date(Date.UTC(y, mo - 1, d)).getUTCDay() }; };
    const longDate = (ymd) => {
      if (!ta) return new Date(ymd + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
      const x = ymdParts(ymd); return `${TA.weekday[x.wd]}, ${x.d} ${TA.month[x.mo]} ${x.y}`;
    };
    const shortDate = (ymd) => {
      if (!ta) return new Date(ymd + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
      const x = ymdParts(ymd); return `${TA.weekdayShort[x.wd]}, ${x.d} ${TA.monthShort[x.mo]}`;
    };
    const dayOf = (jd) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(P.msFromJd(jd)));
    const dm = (jd) => { const d = dayOf(jd); return ta ? `${+d.slice(8)} ${TA.monthShort[+d.slice(5, 7) - 1]}` : new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }); };
    const till = (jd, ymd) => !jd ? "" : ta
      ? `${dayOf(jd) !== ymd ? dm(jd) + " " : ""}${t(jd)} வரை`
      : `till ${t(jd)}${dayOf(jd) !== ymd ? ", " + dm(jd) : ""}`;
    return { t, range, longDate, shortDate, till };
  }

  const tithiTa = (i) => i === 14 ? "பௌர்ணமி" : i === 29 ? "அமாவாசை" : `${i < 15 ? "வளர்பிறை" : "தேய்பிறை"} ${TA.tithi[i % 15]}`;
  const specialText = (sp, lang, tamilMonthIndex) => {
    if (lang !== "ta") return { name: sp.name, note: sp.note };
    const [n, note] = TA.special[sp.key] || [sp.name, sp.note];
    return { name: n.replace("{m}", TA.tamilMonth[tamilMonthIndex]), note };
  };

  const site = () => String(SITE.websiteUrl || location.origin + location.pathname.replace(/[^/]*$/, ""));
  const siteShort = () => site().replace(/^https?:\/\//, "").replace(/\/$/, "");

  /* ---------- Data for one day, in one language ---------- */
  function dataFor(ymd, lang = "en") {
    const ta = lang === "ta";
    const f = fmt(lang);
    const loc = SITE.panchangLocation;
    const d = P.day(ymd, loc);
    const L = ta ? TA.label : null;
    const name = {
      tithi: (i, en) => ta ? tithiTa(i) : en,
      star: (i, en) => ta ? TA.star[i] : en,
      yoga: (i, en) => ta ? TA.yoga[i] : en,
      rasi: (i, en) => ta ? TA.rasi[i] : en
    };
    const tamilMonth = ta ? TA.tamilMonth[d.tamil.monthIndex] : d.tamil.month;
    // Today's special (or first day of a Tamil month)
    let special = d.specials[0] ? Object.assign({ key: d.specials[0].key }, d.specials[0]) : null;
    if (!special && d.tamil.firstDay) special = { key: "month", name: `First day of ${d.tamil.month}`, note: "Tharpanam is offered on the first day of the Tamil month." };
    if (special) special = Object.assign(special, specialText(special, lang, d.tamil.monthIndex));
    const upcoming = P.upcoming(ymd, loc, 30).slice(0, 4).map((u) => {
      const tm = u.key === "month" ? P.tamilDate(u.date, loc).monthIndex : d.tamil.monthIndex;
      return Object.assign({}, u, specialText(u, lang, tm));
    });
    const c = d.chandrashtamam;
    const stars = (r) => P.rasiStars(r, ta ? TA.star : undefined).join(", ");
    const chandra = `${name.rasi(c.rasiIndex, c.rasi)} (${stars(c.rasiIndex)})` +
      (c.end && c.next ? ta
        ? ` ${f.till(c.end, ymd)}, பின்பு ${name.rasi(c.next.rasiIndex, c.next.rasi)} (${stars(c.next.rasiIndex)})`
        : ` ${f.till(c.end, ymd)}, then ${c.next.rasi} (${stars(c.next.rasiIndex)})` : "");
    const nextTithi = (d.tithi.index + 1) % 30;
    return {
      ymd, d, loc, lang, f, special, upcoming, chandra, tamilMonth,
      city: ta ? (loc.name === "Chennai" ? TA.label.city : loc.name) : loc.name,
      rows: [
        [ta ? L.tithi : "Tithi", name.tithi(d.tithi.index, d.tithi.name), d.tithi.end ? (ta ? `${f.till(d.tithi.end, ymd)}, பின்பு ${tithiTa(nextTithi)}` : `${f.till(d.tithi.end, ymd)}, then ${d.tithi.next}`) : ""],
        [ta ? L.nakshatram : "Nakshatram", name.star(d.nakshatra.index, d.nakshatra.name), f.till(d.nakshatra.end, ymd)],
        [ta ? L.yoga : "Yoga", name.yoga(d.yoga.index, d.yoga.name), f.till(d.yoga.end, ymd)],
        [ta ? L.sun : "Sunrise · Sunset", `${f.t(d.sunrise)} · ${f.t(d.sunset)}`, ""],
        [ta ? L.rahu : "Rahu Kalam", f.range(d.rahu), ""],
        [ta ? L.yama : "Yamagandam", f.range(d.yamagandam), ""],
        [ta ? L.gulika : "Gulika", f.range(d.gulika), ""]
      ],
      nalla: d.nallaNeram.map(f.range)
    };
  }

  /* ---------- WhatsApp text ---------- */
  function shareText(x) {
    const ta = x.lang === "ta", d = x.d, f = x.f, L = TA.label;
    const row = (i, emoji) => `${emoji} *${x.rows[i][0]}:* ${x.rows[i][1]}${x.rows[i][2] ? ` (${x.rows[i][2]})` : ""}`;
    const lines = [
      `🔥 *${ta ? L.title : "Today's Panchangam"}* – ${f.longDate(x.ymd)}`,
      `${x.tamilMonth} ${d.tamil.day} · ${x.city}`,
      "",
      row(0, "📅"), row(1, "⭐"), row(2, "🔱"),
      ta ? `🌅 *${L.sunrise}:* ${f.t(d.sunrise)}   🌇 *${L.sunset}:* ${f.t(d.sunset)}` : `🌅 *Sunrise:* ${f.t(d.sunrise)}   🌇 *Sunset:* ${f.t(d.sunset)}`,
      `⛔ *${x.rows[4][0]}:* ${x.rows[4][1]}`,
      `⚠️ *${x.rows[5][0]}:* ${x.rows[5][1]}`,
      `⏳ *${x.rows[6][0]}:* ${x.rows[6][1]}`,
      x.nalla.length ? `✅ *${ta ? L.nalla : "Nalla Neram"}:* ${x.nalla.join(", ")}` : "",
      `🌙 *${ta ? L.chandra : "Chandrashtamam"}:* ${x.chandra}`
    ];
    if (x.special) lines.push("", `🔔 *${ta ? L.todaySpecial : "Today"}: ${x.special.name}* – ${x.special.note}`);
    if (x.upcoming.length) {
      lines.push("", `📌 *${ta ? L.coming : "Coming up"}:*`);
      x.upcoming.forEach((u) => lines.push(`• ${f.shortDate(u.date)} – ${u.name}`));
    }
    lines.push("", ta ? `🙏 ${L.book}` : "🙏 Book a live online puja or a Pandit at your home:", site(), `📞 WhatsApp: ${SITE.phoneDisplay}`);
    return lines.filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i > 0)).join("\n");
  }

  /* ---------- Image ---------- */
  const W = 1080, H = 1350;
  const C = { maroon: "#6e1a24", maroonDark: "#4f1019", saffron: "#e2711d", saffronDark: "#c55a0c", gold: "#c9a44c", goldSoft: "#f3e6c4", cream: "#fdf8f0", cream2: "#f8efe2", ink: "#2b1d17", inkSoft: "#6b5a50", line: "#eadfce", green: "#17733b", greenBg: "#eaf6ee", amber: "#9a5a00", amberBg: "#fff3df" };
  const FONTS = {
    en: { head: '"Cormorant Garamond", Georgia, serif', body: 'Poppins, "Segoe UI", sans-serif' },
    ta: { head: '"Noto Serif Tamil", "Noto Sans Tamil", "Nirmala UI", Latha, serif', body: '"Noto Sans Tamil", "Nirmala UI", Latha, Poppins, sans-serif' }
  };

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
  // Use the given font size, shrinking it until the text fits maxW
  function fitFont(ctx, weight, size, family, text, maxW, min = 18) {
    let s = size;
    ctx.font = `${weight} ${s}px ${family}`;
    while (s > min && ctx.measureText(text).width > maxW) { s -= 2; ctx.font = `${weight} ${s}px ${family}`; }
    return s;
  }
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  async function drawImage(canvas, x) {
    const ta = x.lang === "ta", F = FONTS[x.lang] || FONTS.en, EN = FONTS.en, L = TA.label;
    const sample = ta ? "தமிழ் பஞ்சாங்கம் 0123" : "Panchangam 0123";
    try {
      await Promise.all([document.fonts.load(`700 60px ${F.head}`, sample), document.fonts.load(`500 30px ${F.body}`, sample),
        document.fonts.load(`600 30px ${F.body}`, sample), document.fonts.load(`700 60px ${EN.head}`), document.fonts.load(`600 30px ${EN.body}`)]);
    } catch (e) { /* fall back to system fonts */ }
    const logo = await loadImg("images/logo.svg");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const pad = 64, inner = W - pad * 2, f = x.f;

    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);

    // Header band
    const hg = ctx.createLinearGradient(0, 0, W, 0);
    hg.addColorStop(0, C.maroonDark); hg.addColorStop(1, C.maroon);
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 190);
    ctx.fillStyle = C.gold; ctx.fillRect(0, 190, W, 6);
    if (logo) { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(pad + 48, 95, 52, 0, Math.PI * 2); ctx.fill(); ctx.drawImage(logo, pad + 6, 53, 84, 84); }
    ctx.fillStyle = "#fff"; ctx.font = `700 64px ${EN.head}`; ctx.textBaseline = "alphabetic";
    ctx.fillText(SITE.name || "Agni Puja", pad + 124, 100);
    ctx.fillStyle = C.gold; ctx.font = ta ? `600 22px ${F.body}` : `600 22px ${EN.body}`;
    ctx.fillText(ta ? L.tagline : "ONLINE PUJA SERVICES", pad + 128, 138);
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = `600 26px ${F.body}`;
    ctx.fillText(ta ? L.today : "Today's", W - pad, 88);
    ctx.fillStyle = C.gold; fitFont(ctx, 700, ta ? 40 : 46, F.head, ta ? L.panchangam : "Panchangam", 300);
    ctx.fillText(ta ? L.panchangam : "Panchangam", W - pad, 136); ctx.textAlign = "left";

    // Date
    let y = 270;
    ctx.fillStyle = C.maroon; fitFont(ctx, 700, ta ? 48 : 58, F.head, f.longDate(x.ymd), inner);
    ctx.fillText(f.longDate(x.ymd), pad, y);
    y += 46; ctx.fillStyle = C.saffronDark; ctx.font = `500 28px ${F.body}`;
    ctx.fillText(`${x.tamilMonth} ${x.d.tamil.day}  ·  ${x.city}`, pad, y);

    // Panchang rows
    y += 34;
    const rowH = 58, labelW = ta ? 300 : 290;
    x.rows.forEach(([label, value, sub], i) => {
      if (i % 2 === 0) roundRect(ctx, pad - 16, y, inner + 32, rowH, 14, C.cream2);
      ctx.fillStyle = C.inkSoft; fitFont(ctx, 600, 22, F.body, ta ? label : label.toUpperCase(), labelW - 16, 16);
      ctx.fillText(ta ? label : label.toUpperCase(), pad, y + 37);
      ctx.fillStyle = C.maroon; fitFont(ctx, 600, ta ? 26 : 29, F.body, value, inner - labelW, 18);
      ctx.fillText(value, pad + labelW, y + 37);
      if (sub) {
        const vw = ctx.measureText(value).width;
        ctx.fillStyle = C.inkSoft; ctx.font = `400 ${ta ? 19 : 21}px ${F.body}`;
        const room = inner - labelW - vw - 24;
        // If "till … , then …" doesn't fit, keep only the "till …" part
        const s = ctx.measureText(sub).width <= room ? sub : sub.split(", ")[0];
        if (room > 120 && ctx.measureText(s).width <= room) ctx.fillText(s, pad + labelW + vw + 16, y + 37);
      }
      y += rowH;
    });

    // Nalla Neram – break lines only between time ranges
    y += 18;
    ctx.font = `600 ${ta ? 25 : 28}px ${F.body}`;
    const nallaLines = [];
    { let line = ""; (x.nalla.length ? x.nalla : ["—"]).forEach((r) => { const test = line ? line + "   ·   " + r : r; if (line && ctx.measureText(test).width > inner - 40) { nallaLines.push(line); line = r; } else line = test; }); if (line) nallaLines.push(line); }
    const nh = 66 + nallaLines.length * 38;
    roundRect(ctx, pad - 16, y, inner + 32, nh, 16, C.greenBg, "#cfe9d7");
    ctx.fillStyle = C.green; ctx.font = `600 22px ${F.body}`; ctx.fillText(ta ? `✓  ${L.nalla}` : "✓  NALLA NERAM", pad + 8, y + 40);
    ctx.font = `600 ${ta ? 25 : 28}px ${F.body}`;
    nallaLines.forEach((l, i) => ctx.fillText(l, pad + 8, y + 80 + i * 38));
    y += nh + 16;

    // Chandrashtamam
    ctx.font = `500 ${ta ? 23 : 25}px ${F.body}`;
    const chLines = wrap(ctx, x.chandra, inner - 20).slice(0, 3);
    const chH = 62 + chLines.length * 34;
    roundRect(ctx, pad - 16, y, inner + 32, chH, 16, C.amberBg, "#f2d7a6");
    ctx.fillStyle = C.amber; ctx.font = `600 22px ${F.body}`; ctx.fillText(ta ? L.chandra : "CHANDRASHTAMAM", pad + 8, y + 40);
    ctx.fillStyle = C.ink; ctx.font = `500 ${ta ? 23 : 25}px ${F.body}`;
    chLines.forEach((l, i) => ctx.fillText(l, pad + 8, y + 76 + i * 34));
    y += chH + 22;

    // Today's special / coming up
    const footerTop = H - 150;
    if (x.special && y + 110 < footerTop) {
      roundRect(ctx, pad - 16, y, inner + 32, 96, 16, C.goldSoft, C.gold);
      ctx.fillStyle = C.maroon; fitFont(ctx, 700, ta ? 30 : 36, F.head, `${ta ? L.todaySpecial : "Today"}: ${x.special.name}`, inner - 20);
      ctx.fillText(`${ta ? L.todaySpecial : "Today"}: ${x.special.name}`, pad + 8, y + 44);
      ctx.fillStyle = C.inkSoft; ctx.font = `400 ${ta ? 20 : 22}px ${F.body}`;
      ctx.fillText(wrap(ctx, x.special.note, inner - 20)[0], pad + 8, y + 78);
      y += 116;
    }
    if (x.upcoming.length && y + 80 < footerTop) {
      ctx.fillStyle = C.saffronDark; ctx.font = `600 22px ${F.body}`;
      ctx.fillText(ta ? L.coming : "COMING UP", pad, y + 26);
      y += 44;
      ctx.font = `500 ${ta ? 21 : 24}px ${F.body}`;
      let cx = pad;
      for (const u of x.upcoming) {
        const label = `${f.shortDate(u.date)}  ${u.name}`;
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
    ctx.fillStyle = "#fff"; fitFont(ctx, 600, ta ? 25 : 28, F.body, ta ? L.bookShort : "Book a live online puja or a Pandit at home", inner);
    ctx.fillText(ta ? L.bookShort : "Book a live online puja or a Pandit at home", pad, footerTop + 52);
    ctx.font = `600 30px ${EN.body}`; ctx.fillStyle = "#fff4dc";
    ctx.fillText(siteShort(), pad, footerTop + 98);
    ctx.textAlign = "right"; ctx.font = `500 26px ${EN.body}`; ctx.fillStyle = "#fff";
    ctx.fillText(`WhatsApp ${SITE.phoneDisplay}`, W - pad, footerTop + 98);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.8)";
    const note = ta ? L.note.replace("{city}", x.city) : `Timings for ${x.loc.name}. Please confirm with our Pandit for important muhurtham.`;
    fitFont(ctx, 400, 18, F.body, note, inner, 13);
    ctx.fillText(note, pad, footerTop + 132);
  }

  const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, "image/png"));

  /* ---------- Page ---------- */
  const LANG_KEY = "agnipuja:shareLang";
  const savedLang = () => { try { return localStorage.getItem(LANG_KEY) === "ta" ? "ta" : "en"; } catch (e) { return "en"; } };

  function mount(root, ymd, lang) {
    lang = lang || savedLang();
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    const x = dataFor(ymd, lang);
    const text = shareText(x);
    root.innerHTML = `
      <div class="share-layout">
        <div class="share-preview"><canvas id="shareCanvas" aria-label="Panchang image preview"></canvas></div>
        <div class="share-side">
          <div class="panel">
            <h3>Panchang for ${esc(fmt("en").longDate(ymd))}</h3>
            <div class="tabs" role="tablist" aria-label="Language" style="margin-bottom:14px">
              <button type="button" role="tab" data-sh-lang="en" class="${lang === "en" ? "active" : ""}" aria-selected="${lang === "en"}">English</button>
              <button type="button" role="tab" data-sh-lang="ta" class="${lang === "ta" ? "active" : ""}" aria-selected="${lang === "ta"}" lang="ta">தமிழ்</button>
            </div>
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
              <textarea class="input" rows="16" data-sh-text ${lang === "ta" ? 'lang="ta"' : ""}>${esc(text)}</textarea>
            </label>
          </div>
        </div>
      </div>`;

    const canvas = $("#shareCanvas", root);
    const fileName = `agni-puja-panchang-${ymd}${lang === "ta" ? "-tamil" : ""}.png`;
    const shareBtn = $("[data-sh-share]", root), hint = $("[data-sh-hint]", root);
    // Prepare the image file as soon as it is drawn, so tapping Share opens
    // the share menu straight away (phones only allow sharing right after a tap)
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

    const go = (d, l = lang) => mount(root, d, l);
    root.querySelectorAll("[data-sh-lang]").forEach((b) => b.addEventListener("click", () => go(ymd, b.dataset.shLang)));
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
      navigator.share({ files: [file], text: currentText() }).catch((e) => {
        if (e && e.name === "AbortError") return;
        U.toast("Couldn't open the share menu – downloading the image and opening WhatsApp instead.", "info", 6000);
        downloadAndOpenWhatsApp();
      });
    });
  }

  window.AgniShare = { mount, dataFor, shareText };
})();
