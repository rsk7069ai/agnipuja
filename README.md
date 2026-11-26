# Agni Puja – Puja Booking Website

A static website: plain HTML, CSS and JavaScript. There's no build step and no server code, so you can host it anywhere (GitHub Pages, Netlify, cPanel hosting and so on).

Customers can book pujas in two ways:

- **Online Puja**: a Pandit performs the puja live on video. This is built for NRIs, with time slots in the customer's time zone and Prasadam shipping.
- **Pandit at Home**: a Pandit visits the customer's home. This depends on the city and on which Pandits are free.

> **Current phase – booking requests, pay after the puja.** No money is collected on the website. Customers send a booking request; it reaches you in a **Google Sheet + email** (see [GOOGLE-SHEET-SETUP.md](GOOGLE-SHEET-SETUP.md)) or on **WhatsApp**. You call to confirm, and the customer pays after the puja in cash or by UPI / bank transfer.
>
> Login is optional and simulated (Google / OTP / email are saved only in the visitor's browser). The customer dashboard and admin panel show only what is saved on that device. Your Google Sheet is the master list of requests.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Homepage: hero, the two booking types, featured pujas (Tharpanam, Thithi, Upanayanam), NRI section, all pujas, homams, how it works, why choose us, occasions, about, testimonials, FAQs, contact |
| `book.html` | Step-by-step booking request: type → puja → details → preferred date and time → review and send → request received. Login is optional |
| `login.html` | Log in or sign up with Google, mobile OTP or email |
| `profile.html` | Customer registration form: name, mobile, email and full address, saved for future bookings |
| `nri.html` | NRI Online Puja: country and time zone, slots in local time, pay-after-the-puja options and a Prasadam shipping table |
| `puja.html?id=…` | Detail page for one puja, with prices for online and at-home bookings |
| `dashboard.html` | Customer dashboard: upcoming bookings and booking history, live puja links, Prasadam tracking, payments due, saved addresses, profile, change time and cancel |
| `admin.html` | Admin panel: reports and revenue, bookings (confirm after the call, assign Pandit, meeting link, mark paid, complete, cancel, reminders), Pandit availability, cities, puja services and prices, customers, payments, Prasadam shipping, notifications |

## Files

| File | What it is |
|---|---|
| `js/pujas-data.js` | **All editable content:** pujas and prices, cities, countries, sample Pandits, time slots, booking rules, FAQs, testimonials, contact details |
| `js/store.js` | Data layer: accounts, bookings, Pandit availability, pricing, refunds. This is the file to replace with a real backend |
| `js/ui.js` | Shared header and footer for the new pages, account menu, popups and the time-slot picker |
| `js/main.js`, `js/home.js` | Homepage behaviour (original sections, then the new ones) |
| `js/book.js`, `js/login.js`, `js/dashboard.js`, `js/admin.js` | Behaviour for each page |
| `css/styles.css` | The original design: colours, fonts and homepage styles |
| `setup/booking-sheet.gs` | Google Apps Script that adds each booking request to your Google Sheet and emails you |
| `css/app.css` | Styles for the booking, login and dashboard pages and the new homepage sections. It uses the same colours and fonts |

## Common edits

- **Add a puja or change a price:** edit the `pujas` list in `js/pujas-data.js`. `modes` sets whether it can be booked online, at home, or both. Set `featured: true` to show it under *Featured Services*.
- **Cities for home visits, countries for NRIs, time slots, refund rules:** these are also in `js/pujas-data.js`.
- **Contact details:** edit the `site` block at the top of `js/pujas-data.js`.
- **Today's Panchang** (below the hero): tithi, nakshatram, yoga, sunrise and sunset, Rahu Kalam, Yamagandam, Gulika, the Tamil date, today's special day and the upcoming ones. It is calculated in the browser by `js/panchang.js` for the location in `site.panchangLocation`, and was checked against Drik Panchang for Chennai (within 1–2 minutes). Add `?panchang=2026-12-08` to the homepage address to preview another day.
- **Show or hide prices:** `showPrices` in the `site` block. It is `false` for now, so customers see no amounts and the price is confirmed on the call. The admin panel always shows prices. Set it to `true` to show prices on the website again.
- **Photos:** put a photo in `images/` and set the puja's `image` to its path. A puja without a photo shows the saffron flame design. Credit any Wikimedia photo in `images/CREDITS.md`.

## How booking works

- No account is needed. Customers enter their name, mobile number and puja details, choose a preferred date and time, and send the request. They also pick how they'll pay after the puja (cash, UPI or bank transfer).
- The request is posted to your Google Sheet and emailed to you. If the sheet isn't connected yet, or sending fails, the customer is asked to send it on WhatsApp with all details filled in.
- Requests start as **Pending confirmation**. After your call, confirm them in the admin panel (online pujas then get a video link), and mark the payment as received after the puja.
- Time slots come from Pandit availability. A slot is shown as free only when at least one active Pandit is free at that time. For a home visit, that Pandit must also serve the customer's city, be working that weekday and not have the date blocked. Home visits keep a Pandit busy for 4 hours (including travel). Online pujas keep a Pandit busy for 2 hours.
- When an online booking is confirmed, it gets a free Jitsi Meet link. Admins can replace it with a Zoom or Google Meet link.
- Customers can change the time up to 24 hours before the puja (it goes back to *Pending confirmation*) and cancel free of charge. Both are sent to you like new requests.

## Admin panel

Open `admin.html` (there's also a link in the footer) and enter the admin password. The site stores only a SHA-256 hash of the password (`ADMIN_HASH` in `js/admin.js`). After 5 wrong attempts, login is paused for 30 seconds.

This keeps casual visitors out, but it is not real security: the check runs in the visitor's browser. Real protection comes with the server login described in [Going live](#later-online-payments-and-real-accounts). To change the password, set `ADMIN_HASH` to the SHA-256 of `agnipuja-admin:` followed by the new password.

In this prototype the admin panel manages the data saved in that browser. Use **Reset demo data** to restore the sample bookings.

## Later: online payments and real accounts

When you're ready to collect payments online, replace the simulated parts in `js/store.js` with real services:

1. **Backend and database** (for example Firebase or Supabase) to store customers, bookings, Pandits and cities centrally, so the admin sees every customer's bookings.
2. **Login:** Firebase Authentication (or similar) handles *Continue with Google*, *mobile OTP* (real SMS) and email/password.
3. **Payments:** Razorpay for India (UPI, cards, net banking), plus Stripe or PayPal for international cards. Create the booking only after the payment gateway confirms payment on the server.
4. **Notifications:** an SMS provider (such as MSG91 or Twilio), an email service, and the WhatsApp Business API to send confirmations and reminders.
5. **Admin security:** protect `admin.html` with an admin-only login checked on the server.

## Preview locally

```
python -m http.server 5500
```

Then visit http://localhost:5500.

## Image licences

The sample photos come from Wikimedia Commons under CC BY / CC BY-SA licences. These licences require you to credit the photographers, which the footer's "Photo credits" link does. Ideally, replace them with your own puja photos before launch.
