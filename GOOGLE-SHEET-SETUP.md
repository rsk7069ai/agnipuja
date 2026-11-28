# Receive booking requests in Google Sheets + email

Once set up, every booking request from the website arrives as a **new row in your Google Sheet** and an **email to you**. Changes and cancellations made by customers arrive the same way. It's free and takes about 10 minutes.

Until this is set up, customers see a button asking them to send their request to you on **WhatsApp**.

## 1. Create the sheet

1. Sign in to the Google account where you want to receive bookings.
2. Open **https://sheets.new** to create a new spreadsheet, and name it **Agni Puja Bookings**.

## 2. Add the script

1. In the sheet, open **Extensions → Apps Script**.
2. Delete the code that's there, then paste in everything from [`setup/booking-sheet.gs`](setup/booking-sheet.gs).
3. Click the **Save** (disk) icon.

## 3. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to *Select type* and choose **Web app**.
3. Set **Execute as:** *Me*, and **Who has access:** *Anyone*.
4. Click **Deploy**, then **Authorize access** and choose your Google account.
   - Google warns *"Google hasn't verified this app"*. That's normal for your own script: click **Advanced → Go to … (unsafe)** → **Allow**.
5. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy…/exec`.

## 4. Connect the website

Send the Web app URL to Claude, or paste it yourself in `js/pujas-data.js`:

```js
bookingEndpoint: "https://script.google.com/macros/s/AKfy…/exec",
```

Then commit and push.

## 5. Test it

Make a test booking on the website. Within a few seconds you should see a new row in the **Booking requests** tab and an email in your inbox. Turn on Gmail notifications on your phone so you hear about new bookings straight away.

## 6. Admin password

The admin page's password is stored **only in Apps Script**, never in the website code (which is public on GitHub). Google checks it every time you log in. The same password lets the admin page read every booking and set its status.

**Set or change the password (any time):**
1. In Apps Script, click **Project Settings** (gear icon on the left).
2. Scroll to **Script Properties**. Click **Edit script properties** (or **Add script property** the first time).
3. Property: `ADMIN_KEY`. Value: your password — at least 8 characters, hard to guess, e.g. 3–4 random words like `mango-river-lamp-1947`.
4. Click **Save script properties**. That's it — no redeploy needed. Anyone logged in with the old password is logged out the next time the page loads bookings.

**Log in:** open the website's **Admin** page and enter the password. Tick *Keep me logged in on this device* only on your own phone or computer.

Keep the password private. After 10 wrong passwords, login is blocked for 15 minutes. If you forget it, open Script Properties to see or change it.

## 7. Customers track their booking

Customers don't log in. You share their **booking ID** with them (WhatsApp, SMS or email), and they check it on the website's **Track Booking** page with that ID and the phone number they booked with. You can also send a direct link: `https://www.agnipuja.com/track.html?id=AP261127-K7Q2M`.

- **Set the status on the admin page:** Admin → **Booking Requests** → the Status menu under the booking ID (Pending, Confirmed, Completed, Cancelled). It's saved in the sheet's **Status** column and the customer sees it straight away. (The admin *Bookings* tab only holds bookings made on that device; customers don't see changes made there.)
- You can also type the status in the sheet's Status column yourself. If the customer asked for a time change, update the newest row of that booking.
- The customer only sees their puja, date and time, status and history — never other customers' details. After 10 wrong tries for one booking ID, tracking that ID is paused for 15 minutes.

## Good to know

- **Changing the script later:** in Apps Script, use **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.
- **Email limit:** a free Google account can send about 100 emails a day. Rows are still added to the sheet if this limit is reached.
- **Privacy:** the sheet holds customers' names, phone numbers and addresses. Share it only with people who need it.
