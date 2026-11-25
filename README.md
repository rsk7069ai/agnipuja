# Agni Puja – Homepage

A static homepage: plain HTML, CSS and JavaScript. There's no build step and no server code, so you can host it anywhere (Netlify, GitHub Pages, cPanel hosting and so on).

## Files

| File | What it is |
|---|---|
| `index.html` | Page structure (header, hero, sections, footer, popups) |
| `css/styles.css` | All styling. The colours and fonts are set at the top (`:root`) |
| `js/pujas-data.js` | **All editable content:** pujas, occasions, testimonials and contact details |
| `js/main.js` | Builds the cards and runs the popups, filter, menu and enquiry form |
| `images/` | Photos and logo. See `images/CREDITS.md` |

## Common edits

- **Add a puja:** open `js/pujas-data.js`, copy one `{ ... }` block in `pujas`, then change it. The card, details popup, footer link and enquiry dropdown all update automatically. Set `popular: true` on a homam to also show it under *Popular Homams*.
- **Change your phone, WhatsApp, email, address or social links:** edit the `site` block at the top of `js/pujas-data.js`. The numbers there now are samples.
- **Replace photos:** put your own photo in `images/` using the same file name, or change the `image` path. A card with a missing photo shows a saffron flame design instead.

## Enquiry form

No backend is needed. When someone submits the form, it opens **WhatsApp** (or their **email app**) with all their details filled in, addressed to your number or email. To collect enquiries in an inbox or spreadsheet instead, you can later point the form at a service like Formspree or Google Forms.

## Preview locally

Open `index.html` in a browser, or run:

```
python -m http.server 5500
```

Then visit http://localhost:5500.

## Image licences

The sample photos come from Wikimedia Commons under CC BY / CC BY-SA licences. These licences require you to credit the photographers, which the footer's "Photo credits" link does. Ideally, replace them with your own puja photos before launch.
