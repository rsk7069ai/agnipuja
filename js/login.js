/* Agni Puja – login / sign-up (Google, mobile OTP, email).
   In this prototype everything is simulated in the browser; see README
   "Going live" for connecting Firebase Authentication or similar. */
(function () {
  "use strict";
  const A = window.Agni, U = window.AgniUI;
  const { $, $$, esc } = U;
  // Customer login is switched off for now (see js/ui.js mountAccount).
  location.replace("track.html");
  return;

  // Only allow redirects back to pages on this site
  const rawNext = U.qs("next") || "dashboard.html";
  const next = /^[a-z0-9-]+\.html([?#].*)?$/i.test(rawNext) ? rawNext : "dashboard.html";

  function done(u, isNew) {
    U.toast(isNew ? "Account created. Welcome!" : `Welcome${u.name ? ", " + esc(u.name.split(" ")[0]) : ""}!`, "info", 2500);
    const target = A.profileComplete(u) ? next : "profile.html?next=" + encodeURIComponent(next) + "&new=1";
    setTimeout(() => location.replace(target), 400);
  }
  if (A.currentUser()) { location.replace(next); return; }

  const errBox = $("#authError");
  const showErr = (m) => { errBox.textContent = m; errBox.hidden = !m; };

  /* Tabs */
  $$("[data-tab]").forEach((t) => t.addEventListener("click", () => {
    $$("[data-tab]").forEach((x) => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", String(x === t)); });
    const phone = t.dataset.tab === "phone";
    $("#phoneForm").hidden = !phone;
    $("#otpForm").hidden = true;
    $("#emailForm").hidden = phone;
    showErr("");
  }));

  /* ---------- Google (simulated account chooser) ---------- */
  $("#googleBtn").addEventListener("click", () => {
    const m = U.modal(`
      <h3>Continue with Google</h3>
      <p class="modal-intro">Prototype: enter the Google account to use. In the live site this opens Google's own sign-in window.</p>
      <form class="form" novalidate>
        <label class="field">Name on your Google account<input name="name" autocomplete="name" required></label>
        <label class="field">Gmail address<input name="email" type="email" autocomplete="email" placeholder="you@gmail.com" required></label>
        <p class="form-error" hidden></p>
        <button class="btn btn-primary btn-block" type="submit">Continue</button>
      </form>`);
    const f = $("form", m.el);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = f.name.value.trim(), email = f.email.value.trim();
      const er = $(".form-error", f);
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { er.textContent = "Please enter your name and a valid email."; er.hidden = false; return; }
      const existed = A.users().some((u) => u.email === A.normEmail(email));
      const u = A.loginGoogle({ name, email });
      m.close();
      done(u, !existed);
    });
  });

  /* ---------- Mobile OTP ---------- */
  const dial = $("#dialSelect");
  dial.innerHTML = A.countries().filter((c) => c.dial).map((c) => `<option value="${c.dial}">${c.dial} ${c.code}</option>`).join("");
  let phoneFull = "", timer = null;

  function startResendTimer() {
    let s = 30;
    const btn = $("#resendOtp");
    btn.disabled = true;
    clearInterval(timer);
    timer = setInterval(() => {
      s--;
      btn.textContent = s > 0 ? `Resend in ${s}s` : "Resend OTP";
      if (s <= 0) { clearInterval(timer); btn.disabled = false; }
    }, 1000);
  }
  function sendCode() {
    const code = A.sendOtp(phoneFull);
    U.toast(`<strong>SMS (demo) to ${esc(phoneFull)}</strong><br>Your Agni Puja OTP is <strong>${code}</strong>. Valid for 5 minutes.`, "sms", 12000);
    startResendTimer();
  }

  const boxes = $("#otpBoxes");
  boxes.innerHTML = Array.from({ length: 6 }, (_, i) => `<input class="input" inputmode="numeric" autocomplete="${i === 0 ? "one-time-code" : "off"}" aria-label="Digit ${i + 1}">`).join("");
  const digits = $$("input", boxes);
  digits.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      const v = inp.value.replace(/\D/g, "");
      if (v.length > 1) { // pasted, autofilled or fast-typed digits fill the next boxes
        v.slice(0, 6 - i).split("").forEach((d, j) => { digits[i + j].value = d; });
        digits[Math.min(i + v.length, 6) - 1].focus();
        if (digits.every((d) => d.value)) $("#otpForm").requestSubmit();
        return;
      }
      inp.value = v;
      if (v && digits[i + 1]) digits[i + 1].focus();
      if (digits.every((d) => d.value)) $("#otpForm").requestSubmit();
    });
    inp.addEventListener("keydown", (e) => { if (e.key === "Backspace" && !inp.value && digits[i - 1]) digits[i - 1].focus(); });
  });

  $("#phoneForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const num = e.target.phone.value.replace(/\D/g, "");
    const d = dial.value;
    if ((d === "+91" && num.length !== 10) || num.length < 6 || num.length > 12) {
      e.target.phone.classList.add("invalid");
      showErr(d === "+91" ? "Please enter a 10-digit mobile number." : "Please enter a valid mobile number.");
      return;
    }
    e.target.phone.classList.remove("invalid");
    showErr("");
    phoneFull = d + num;
    $("#otpTo").textContent = d + " " + num;
    $("#phoneForm").hidden = true;
    $("#otpForm").hidden = false;
    digits.forEach((x) => (x.value = ""));
    digits[0].focus();
    sendCode();
  });
  $("#changeNumber").addEventListener("click", () => { $("#otpForm").hidden = true; $("#phoneForm").hidden = false; clearInterval(timer); });
  $("#resendOtp").addEventListener("click", sendCode);
  $("#otpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = digits.map((d) => d.value).join("");
    if (code.length < 6) { showErr("Please enter the 6-digit code."); return; }
    try {
      const existed = A.users().some((u) => A.normPhone(u.phone) === A.normPhone(phoneFull));
      const u = A.verifyOtp(phoneFull, code);
      clearInterval(timer);
      done(u, !existed);
    } catch (err) {
      showErr(err.message);
      digits.forEach((x) => (x.value = ""));
      digits[0].focus();
    }
  });

  /* ---------- Email ---------- */
  let signup = false;
  const ef = $("#emailForm");
  function setSignup(on) {
    signup = on;
    $("[data-signup-only]", ef).hidden = !on;
    $("#emailSubmit").textContent = on ? "Create account" : "Log in";
    $("#emailSwitchText").textContent = on ? "Already have an account?" : "New to Agni Puja?";
    $("#emailSwitch").textContent = on ? "Log in" : "Create an account";
    ef.password.autocomplete = on ? "new-password" : "current-password";
    showErr("");
  }
  $("#emailSwitch").addEventListener("click", () => setSignup(!signup));
  ef.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = ef.name.value.trim(), email = ef.email.value.trim(), pw = ef.password.value;
    if (signup && !name) return showErr("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr("Please enter a valid email address.");
    if (pw.length < 8) return showErr("Password must be at least 8 characters.");
    try {
      const u = signup ? await A.registerEmail({ name, email, password: pw }) : await A.loginEmail(email, pw);
      done(u, signup);
    } catch (err) {
      showErr(err.message);
      if (/sign up first/.test(err.message)) setSignup(true), showErr(err.message);
    }
  });

  if (U.qs("mode") === "signup") { $$("[data-tab]")[1].click(); setSignup(true); }
})();
