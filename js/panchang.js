/* =====================================================================
   AGNI PUJA – PANCHANG CALCULATIONS
   ---------------------------------------------------------------------
   Works out the day's panchang in the browser – no outside service.
   Sun and moon positions use the standard formulas from Jean Meeus,
   "Astronomical Algorithms" (accurate to a few minutes for tithi and
   nakshatra change times). Sidereal positions use the Lahiri ayanamsa.
   Sunrise and sunset are for the location in js/pujas-data.js
   (site.panchangLocation).
   ===================================================================== */
(function () {
  "use strict";

  const RAD = Math.PI / 180;
  const sin = (d) => Math.sin(d * RAD), cos = (d) => Math.cos(d * RAD);
  const norm = (d) => ((d % 360) + 360) % 360;
  const DELTA_T = 69 / 86400; // TT − UT, in days (about 69 s in the 2020s)

  const jdFromMs = (ms) => ms / 86400000 + 2440587.5;
  const msFromJd = (jd) => (jd - 2440587.5) * 86400000;
  const jdOfDate = (ymd) => { const [y, m, d] = ymd.split("-").map(Number); return jdFromMs(Date.UTC(y, m - 1, d)); };

  /* ---------- Sun: apparent ecliptic longitude (Meeus ch. 25) ---------- */
  function sunLongitude(jd) {
    const T = (jd + DELTA_T - 2451545) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    const omega = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
  }

  /* ---------- Moon: ecliptic longitude (Meeus ch. 47, main terms) ---------- */
  // [D, M, M', F, coefficient in 0.000001°]
  const MOON = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294]
  ];
  function moonLongitude(jd) {
    const T = (jd + DELTA_T - 2451545) / 36525;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
    const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    let sum = 0;
    for (const [d, m, mp, f, c] of MOON) {
      const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      sum += c * e * sin(d * D + m * M + mp * Mp + f * F);
    }
    const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.29 * T;
    sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    const omega = 125.04452 - 1934.136261 * T;
    return norm(Lp + sum / 1e6 - 0.00478 * sin(omega)); // with nutation in longitude
  }

  /* ---------- Lahiri ayanamsa ---------- */
  const ayanamsa = (jd) => 23.85706 + 0.01396971 * ((jd - 2451545) / 365.25);
  const sidereal = (lon, jd) => norm(lon - ayanamsa(jd));

  /* ---------- Panchang elements at a moment ---------- */
  const tithiIndex = (jd) => Math.floor(norm(moonLongitude(jd) - sunLongitude(jd)) / 12); // 0–29
  const nakshatraIndex = (jd) => Math.floor(sidereal(moonLongitude(jd), jd) / (360 / 27)); // 0–26
  const yogaIndex = (jd) => Math.floor(norm(sidereal(sunLongitude(jd), jd) + sidereal(moonLongitude(jd), jd)) / (360 / 27));
  const sunSign = (jd) => Math.floor(sidereal(sunLongitude(jd), jd) / 30); // 0 = Mesha

  // When does fn(jd) change from its current value? (search up to `hours` ahead)
  function nextChange(jd, fn, hours = 32) {
    const start = fn(jd);
    let a = jd, b = jd;
    for (let h = 1; h <= hours; h++) { b = jd + h / 24; if (fn(b) !== start) break; a = b; }
    if (fn(b) === start) return null;
    while ((b - a) * 1440 > 0.5) { const m = (a + b) / 2; if (fn(m) === start) a = m; else b = m; }
    return b;
  }

  /* ---------- Sunrise & sunset ---------- */
  function sunTimes(ymd, lat, lon) {
    const jStar = jdOfDate(ymd) + 0.5 - lon / 360; // approximate local noon, in UT
    const n = jStar - 2451545;
    const M = norm(357.5291 + 0.98560028 * n);
    const C = 1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M);
    const lam = norm(M + C + 180 + 102.9372);
    const transit = jStar + 0.0053 * sin(M) - 0.0069 * sin(2 * lam);
    const decl = Math.asin(sin(lam) * sin(23.4397)) / RAD;
    const cosW = (sin(-0.833) - sin(lat) * sin(decl)) / (cos(lat) * cos(decl));
    const w = Math.acos(Math.max(-1, Math.min(1, cosW))) / RAD;
    return { rise: transit - w / 360, set: transit + w / 360, noon: transit };
  }

  /* ---------- Names ---------- */
  const TITHI = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"];
  const tithiName = (i) => i === 14 ? "Pournami" : i === 29 ? "Amavasya" : (i < 15 ? "Shukla " : "Krishna ") + TITHI[i % 15];
  const NAKSHATRA = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Thiruvathirai (Ardra)", "Punarvasu", "Pushya (Poosam)", "Ashlesha (Ayilyam)", "Magha", "Purva Phalguni (Pooram)", "Uttara Phalguni (Uthiram)", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha (Kettai)", "Moola", "Purva Ashadha (Pooradam)", "Uttara Ashadha (Uthiradam)", "Shravana (Thiruvonam)", "Dhanishta (Avittam)", "Shatabhisha (Sadhayam)", "Purva Bhadrapada (Poorattathi)", "Uttara Bhadrapada (Uthirattathi)", "Revati"];
  const YOGA = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
  const TAMIL_MONTH = ["Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"];
  const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Which eighth of the daytime each period falls in, by weekday (Sunday first)
  const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULIKA = [7, 6, 5, 4, 3, 2, 1];
  // Gowri Panchangam: the eight daytime parts, by weekday (Sunday first)
  const GOWRI = [
    ["Uthi", "Amirdha", "Rogam", "Labam", "Dhanam", "Sugam", "Soram", "Visham"],
    ["Amirdha", "Visham", "Rogam", "Labam", "Dhanam", "Sugam", "Soram", "Uthi"],
    ["Rogam", "Labam", "Dhanam", "Sugam", "Soram", "Uthi", "Visham", "Amirdha"],
    ["Labam", "Dhanam", "Sugam", "Soram", "Visham", "Uthi", "Amirdha", "Rogam"],
    ["Dhanam", "Sugam", "Soram", "Uthi", "Amirdha", "Visham", "Rogam", "Labam"],
    ["Sugam", "Soram", "Uthi", "Visham", "Amirdha", "Rogam", "Labam", "Dhanam"],
    ["Soram", "Uthi", "Visham", "Amirdha", "Rogam", "Labam", "Dhanam", "Sugam"]
  ];
  const GOWRI_GOOD = ["Amirdha", "Uthi", "Labam", "Sugam", "Dhanam"];

  /* ---------- Special days ----------
     Amavasya / Pournami: the tithi in force at midday.
     Ekadashi / Shashti: the tithi at sunrise.
     Pradosham: Trayodashi at sunset. Sankatahara Chaturthi: Krishna
     Chaturthi about an hour after sunset (moonrise). */
  const SPECIAL = [
    { key: "amavasya", name: "Amavasya", at: "noon", tithi: [29], puja: "tharpanam", note: "A sacred day to offer Tharpanam to our ancestors." },
    { key: "pournami", name: "Pournami", at: "noon", tithi: [14], puja: "satyanarayana-pooja", note: "Full moon – an auspicious day for Satyanarayana Pooja." },
    { key: "ekadashi", name: "Ekadashi", at: "rise", tithi: [10, 25], puja: "sudarshana-homam", note: "A day of fasting and prayer to Lord Vishnu." },
    { key: "pradosham", name: "Pradosham", at: "set", tithi: [12, 27], puja: "special-pujas", note: "Evening worship of Lord Shiva – ideal for Rudrabhishekam." },
    { key: "sankatahara", name: "Sankatahara Chaturthi", at: "moonrise", tithi: [18], puja: "ganapathi-homam", note: "A special day to pray to Lord Ganesha." },
    { key: "shashti", name: "Shashti", at: "rise", tithi: [5], puja: "special-pujas", note: "A special day for Lord Murugan." }
  ];

  function moments(ymd, loc) {
    const s = sunTimes(ymd, loc.lat, loc.lon);
    const midday = jdFromMs(Date.parse(ymd + "T12:00:00+05:30"));
    return { rise: s.rise, set: s.set, noon: midday, moonrise: s.set + 1 / 24 };
  }
  const addDays = (ymd, n) => { const [y, m, d] = ymd.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };

  function specialsOn(ymd, loc) {
    const t = moments(ymd, loc), tp = moments(addDays(ymd, -1), loc);
    return SPECIAL.filter((sp) => {
      const at = sp.at === "rise" ? "rise" : sp.at === "set" ? "set" : sp.at === "noon" ? "noon" : "moonrise";
      if (!sp.tithi.includes(tithiIndex(t[at]))) return false;
      // a long tithi can cover the same moment on two days – keep only the first
      return !sp.tithi.includes(tithiIndex(tp[at]));
    });
  }

  /* Tamil solar month and day: a new month starts on the day the sun has
     entered the new sign by sunset. */
  function tamilDate(ymd, loc) {
    const sign = sunSign(sunTimes(ymd, loc.lat, loc.lon).set);
    let day = 1, d = ymd;
    for (let i = 0; i < 32; i++) {
      const prev = addDays(d, -1);
      if (sunSign(sunTimes(prev, loc.lat, loc.lon).set) !== sign) break;
      day++; d = prev;
    }
    return { month: TAMIL_MONTH[sign], day, firstDay: day === 1 };
  }

  function day(ymd, loc) {
    const s = sunTimes(ymd, loc.lat, loc.lon);
    const wd = new Date(ymd + "T12:00:00Z").getUTCDay();
    const part = (s.set - s.rise) / 8;
    const period = (k) => ({ start: s.rise + (k - 1) * part, end: s.rise + k * part });
    // Nalla Neram: the good Gowri parts of the day, leaving out Rahu Kalam
    // and Yamagandam; touching parts are joined into one period.
    const nallaNeram = [];
    GOWRI[wd].forEach((g, i) => {
      const k = i + 1;
      if (!GOWRI_GOOD.includes(g) || k === RAHU[wd] || k === YAMA[wd]) return;
      const p = period(k), last = nallaNeram[nallaNeram.length - 1];
      if (last && Math.abs(last.end - p.start) < 1e-6) { last.end = p.end; last.names.push(g); }
      else nallaNeram.push({ start: p.start, end: p.end, names: [g] });
    });
    const ti = tithiIndex(s.rise), na = nakshatraIndex(s.rise), yo = yogaIndex(s.rise);
    const tiEnd = nextChange(s.rise, tithiIndex), naEnd = nextChange(s.rise, nakshatraIndex), yoEnd = nextChange(s.rise, yogaIndex);
    return {
      date: ymd, weekday: WEEKDAY[wd], sunrise: s.rise, sunset: s.set,
      tithi: { name: tithiName(ti), end: tiEnd, next: tithiName((ti + 1) % 30) },
      nakshatra: { name: NAKSHATRA[na], end: naEnd, next: NAKSHATRA[(na + 1) % 27] },
      yoga: { name: YOGA[yo], end: yoEnd },
      rahu: period(RAHU[wd]), yamagandam: period(YAMA[wd]), gulika: period(GULIKA[wd]),
      nallaNeram, gowri: GOWRI[wd].map((name, i) => Object.assign({ name, good: GOWRI_GOOD.includes(name) }, period(i + 1))),
      tamil: tamilDate(ymd, loc),
      specials: specialsOn(ymd, loc)
    };
  }

  function upcoming(ymd, loc, days = 35) {
    const out = [];
    for (let i = 1; i <= days; i++) {
      const d = addDays(ymd, i);
      specialsOn(d, loc).forEach((sp) => out.push(Object.assign({ date: d }, sp)));
      const tm = tamilDate(d, loc);
      if (tm.firstDay) out.push({ date: d, key: "month", name: `Tamil month ${tm.month} begins`, puja: "tharpanam", note: "Tharpanam is offered on the first day of the Tamil month." });
    }
    return out;
  }

  window.Panchang = {
    day, upcoming, specialsOn, tamilDate, sunTimes,
    tithiIndex, nakshatraIndex, yogaIndex, tithiName, sunLongitude, moonLongitude, ayanamsa,
    msFromJd, jdFromMs, addDays
  };
})();
