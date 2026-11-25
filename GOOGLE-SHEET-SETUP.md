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

## Good to know

- **Changing the script later:** in Apps Script, use **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.
- **Email limit:** a free Google account can send about 100 emails a day. Rows are still added to the sheet if this limit is reached.
- **Privacy:** the sheet holds customers' names, phone numbers and addresses. Share it only with people who need it.
