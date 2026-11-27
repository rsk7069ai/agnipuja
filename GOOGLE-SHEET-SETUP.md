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

## 6. See all bookings in the admin page

The admin page's **Booking Requests** tab reads the bookings from this sheet, so you can see every customer's request from any phone or computer. It's protected by a secret admin key that only you know.

1. In Apps Script, click **Project Settings** (gear icon on the left).
2. Scroll to **Script Properties** → **Add script property**.
3. Property: `ADMIN_KEY`. Value: a long secret that's hard to guess, for example 3–4 random words like `mango-river-lamp-1947`. Click **Save script properties**.
4. If you changed the script code, deploy a new version (see *Changing the script later* below).
5. Open the website's **Admin** page → **Booking Requests**, enter the key, and click **Show bookings**. Tick *Remember on this device* only on your own phone or computer.

Never put the key in the code files or share it — anyone with the key and the web app link can read customer details. After 10 wrong keys, reading is blocked for 15 minutes. To change the key, edit `ADMIN_KEY` in Script Properties (no redeploy needed).

## 7. Customers track their booking

Customers don't log in. You share their **booking ID** with them (WhatsApp, SMS or email), and they check it on the website's **Track Booking** page with that ID and the phone number they booked with. You can also send a direct link: `https://rsk7069ai.github.io/agnipuja/track.html?id=AP261127-K7Q2M`.

- The sheet has a **Status** column. New requests show *Pending – we will call you*. After your call, type **Confirmed** (later **Completed**) in that booking's row, and the customer sees it straight away.
- If the customer asks for a time change, a new row is added with *Pending* again. Update the Status in that newest row.
- The customer only sees their puja, date and time, status and history — never other customers' details. After 10 wrong tries for one booking ID, tracking that ID is paused for 15 minutes.

## Good to know

- **Changing the script later:** in Apps Script, use **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.
- **Email limit:** a free Google account can send about 100 emails a day. Rows are still added to the sheet if this limit is reached.
- **Privacy:** the sheet holds customers' names, phone numbers and addresses. Share it only with people who need it.
