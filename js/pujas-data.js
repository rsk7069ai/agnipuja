/* =====================================================================
   AGNI PUJA – SITE CONTENT
   ---------------------------------------------------------------------
   This is the main file you edit to change content on the website.
   No coding knowledge is needed – just copy an existing block, paste
   it, and change the text.

   HOW TO ADD A NEW PUJA
   1. Copy one { ... } block inside the `pujas` list below.
   2. Paste it after the last one (keep the comma between blocks).
   3. Give it a unique `id` (lowercase, no spaces, e.g. "rudra-homam").
   4. Set `type` to "homam", "pooja" or "ceremony".
   5. Set `popular: true` if it should also appear under "Popular Homams".
   6. Set `featured: true` to show it in the "Featured Pujas" section.
   7. Set the prices (in rupees) and the booking `modes` it allows:
      "online" (live video puja) and/or "home" (Pandit visits the home).
   8. Put a photo in the /images folder (or use a web link) and set `image`.
   That's it – the card, details popup, puja page and booking form update
   themselves.
   ===================================================================== */

window.AGNI_DATA = {
  /* ---------- Contact details (replace with your real details) ---------- */
  site: {
    name: "Agni Puja",
    tagline: "Online Puja Services",
    phoneDisplay: "+91 98410 58644",
    phoneLink: "+919841058644",
    whatsapp: "919841058644", // country code + number, no "+" or spaces
    email: "muralisastry2011@gmail.com",
    address: "Periyar Nagar, Chennai, Tamil Nadu",
    hours: "Every day, 6:00 AM – 9:00 PM",
    // Where booking requests are sent: paste your Google Apps Script web
    // app link here (see GOOGLE-SHEET-SETUP.md). Until it is set, customers
    // are asked to send their request to you on WhatsApp.
    bookingEndpoint: "https://script.google.com/macros/s/AKfycbzP-iCFASCAFN81YVaA7jjVAPGoswoHLe7_9SqsOqrq19tz9EgMcn4gn96k_DqTevA/exec",
    // Location used for the homepage "Today's Panchang" (sunrise, Rahu Kalam…)
    panchangLocation: { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    // Show prices to customers? false = prices are hidden on the website and
    // confirmed on the phone call (the admin panel still shows them).
    showPrices: false,
    // How customers can pay (after the puja – no online payment for now)
    paymentOptions: {
      india: ["Cash after the puja", "UPI / bank transfer after the puja"],
      abroad: ["Bank transfer after the puja", "Family in India pays cash"]
    },
    social: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/"
    }
  },

  /* ---------- Pujas & Homams ----------
     price.online / price.home : puja charge in ₹ (Pandit dakshina included)
     samagri : optional puja-materials kit for at-home pujas, in ₹
     modes   : which booking types are offered
     fields  : extra details asked for when booking ("sankalpa" = family
               names, gothram and nakshatram; "departed" = details of the
               departed ancestor; "vatu" = details of the boy) */
  pujas: [
    {
      id: "tharpanam",
      name: "Tharpanam",
      type: "ceremony",
      featured: true,
      popular: false,
      image: "images/tharpanam.jpg",
      short: "Monthly and Amavasya offerings of water and til to honour and nourish our ancestors.",
      description:
        "Tharpanam is the sacred offering of water mixed with black sesame (til) to our Pitrus (ancestors). It is performed on Amavasya, during Mahalaya Paksham, on solar month beginnings and eclipses. Our Pandit guides you through every mantra, so you can perform it correctly even from abroad.",
      benefits: ["Brings peace to departed ancestors", "Removes Pitru dosham", "Blessings of the ancestors for the family"],
      duration: "45 min – 1 hour",
      idealFor: "Amavasya, Mahalaya Paksham, eclipses",
      price: { online: 1500, home: 3100 },
      samagri: 500,
      modes: ["online", "home"],
      fields: ["departed"]
    },
    {
      id: "thithi-shraddham",
      name: "Thithi / Shraddham",
      type: "ceremony",
      featured: true,
      popular: false,
      image: "images/thithi-shraddham.jpg",
      short: "The annual remembrance ritual for a departed parent or ancestor, on the correct thithi.",
      description:
        "Thithi (Shraddham) is the yearly ceremony performed on the lunar day on which a parent or ancestor passed away. It includes Sankalpam, Homam, Pinda Pradhanam and offerings to Brahmanas. Not sure of the thithi date this year? Share the date of passing and our Pandits will calculate it for you.",
      benefits: ["Fulfils a sacred duty to departed parents", "Peace for the departed soul", "Protection and blessings for the family"],
      duration: "2 – 3 hours",
      idealFor: "Annual death anniversary of parents and ancestors",
      price: { online: 4500, home: 9500 },
      samagri: 3500,
      modes: ["online", "home"],
      fields: ["departed"]
    },
    {
      id: "upanayanam",
      name: "Upanayanam",
      type: "ceremony",
      featured: true,
      popular: false,
      image: "images/upanayanam.jpg",
      short: "The sacred thread ceremony – the boy's initiation into Vedic learning and Gayatri mantra.",
      description:
        "Upanayanam (Poonal / Sacred Thread Ceremony) marks a boy's initiation into Vedic study, when he receives the Yagnopaveetham and the Gayatri mantra from his father and guru. We arrange the complete ceremony – Udakashanti, Jaatakarma, Choulam, Upanayanam homam and Brahmopadesam – as per your family tradition.",
      benefits: ["Complete ceremony as per family tradition", "Experienced Vadhyar and assisting Pandits", "Muhurtham fixed for you"],
      duration: "Full day (as per muhurtham)",
      idealFor: "Boys aged 7 – 16",
      price: { home: 21000 },
      samagri: 7000,
      modes: ["home"],
      fields: ["vatu", "sankalpa"]
    },
    {
      id: "ganapathi-homam",
      name: "Ganapathi Homam",
      type: "homam",
      popular: true,
      image: "images/ganapathi-homam.jpg",
      short: "Remove obstacles and begin every new venture with Lord Ganesha's blessings.",
      description:
        "Ganapathi Homam is offered to Lord Ganesha, the remover of obstacles. It is traditionally performed before starting a new home, business, marriage or any important undertaking, so that the work proceeds smoothly and successfully.",
      benefits: ["Removes obstacles in new beginnings", "Brings success in business and studies", "Ideal start to any auspicious event"],
      duration: "2 – 3 hours",
      idealFor: "New beginnings, business, house warming",
      price: { online: 3100, home: 7500 },
      samagri: 2500,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "lakshmi-pooja",
      name: "Lakshmi Pooja",
      type: "pooja",
      popular: false,
      image: "images/lakshmi-pooja.jpg",
      short: "Invite Goddess Lakshmi for prosperity, wealth and harmony in the family.",
      description:
        "Lakshmi Pooja honours Goddess Mahalakshmi, the giver of wealth, abundance and good fortune. It is especially popular on Fridays, during Diwali and Varalakshmi Vratham, and for families seeking financial stability.",
      benefits: ["Prosperity and financial stability", "Peace and harmony at home", "Auspicious for Diwali and Fridays"],
      duration: "1.5 – 2 hours",
      idealFor: "Diwali, Fridays, new business",
      price: { online: 2100, home: 5100 },
      samagri: 1500,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "navagraha-homam",
      name: "Navagraha Homam",
      type: "homam",
      popular: true,
      image: "images/navagraha-homam.jpg",
      short: "Seek the grace of the nine planets to reduce doshas and planetary afflictions.",
      description:
        "Navagraha Homam is performed to please the nine celestial bodies – Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu and Ketu. It helps reduce the effects of unfavourable planetary positions in one's horoscope.",
      benefits: ["Reduces graha doshas", "Brings balance and stability", "Recommended during difficult planetary periods"],
      duration: "3 – 4 hours",
      idealFor: "Horoscope doshas, Shani / Rahu periods",
      price: { online: 4100, home: 9500 },
      samagri: 3000,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "ayushya-homam",
      name: "Ayushya Homam",
      type: "homam",
      popular: true,
      image: "images/ayushya-homam.jpg",
      short: "A sacred homam for long life and good health, often done on birthdays.",
      description:
        "Ayushya Homam is offered to Ayur Devata, the deity of life, for longevity and good health. It is traditionally performed on a child's first birthday, on the birth star (janma nakshatra) and on milestone birthdays.",
      benefits: ["Long and healthy life", "Protection for children", "Blessings on birthdays and birth star"],
      duration: "2 – 3 hours",
      idealFor: "Birthdays, first birthday, elders",
      price: { online: 3500, home: 8500 },
      samagri: 2500,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "sudarshana-homam",
      name: "Sudarshana Homam",
      type: "homam",
      popular: true,
      image: "images/sudarshana-homam.jpg",
      short: "Invoke Lord Vishnu's divine discus for protection from negativity and harm.",
      description:
        "Sudarshana Homam invokes Sri Sudarshana, the divine chakra of Lord Vishnu. It is performed to remove negative energies, protect the family from harm and bring courage and clarity during difficult times.",
      benefits: ["Protection from negativity", "Removes fear and confusion", "Strength during challenging times"],
      duration: "2.5 – 3 hours",
      idealFor: "Protection, health concerns, new home",
      price: { online: 4100, home: 9500 },
      samagri: 3000,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "saraswathi-pooja",
      name: "Saraswathi Pooja",
      type: "pooja",
      popular: false,
      image: "images/saraswathi-pooja.jpg",
      short: "Pray to Goddess Saraswathi for knowledge, wisdom and success in studies.",
      description:
        "Saraswathi Pooja is dedicated to the goddess of learning, music and the arts. It is performed during Navaratri, Vasant Panchami and before exams or Vidyarambham, when children begin their education.",
      benefits: ["Success in education and exams", "Clarity of mind and memory", "Blessings for arts and music"],
      duration: "1 – 1.5 hours",
      idealFor: "Students, Vidyarambham, Navaratri",
      price: { online: 1800, home: 4500 },
      samagri: 1200,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "satyanarayana-pooja",
      name: "Satyanarayana Pooja",
      type: "pooja",
      popular: false,
      image: "images/satyanarayana-pooja.jpg",
      short: "A much-loved family pooja to Lord Vishnu, with the sacred Satyanarayana Katha.",
      description:
        "Satyanarayana Pooja is performed to thank Lord Vishnu and seek his blessings. It includes the recitation of the Satyanarayana Katha and offering of prasadam, and is usually done on Pournami, after a wish is fulfilled or on happy family occasions.",
      benefits: ["Fulfilment of wishes", "Happiness and togetherness in the family", "Gratitude for blessings received"],
      duration: "2 – 2.5 hours",
      idealFor: "Pournami, house warming, family events",
      price: { online: 2500, home: 5500 },
      samagri: 1800,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    },
    {
      id: "gruhapravesam",
      name: "Gruhapravesam",
      type: "ceremony",
      popular: false,
      image: "images/gruhapravesam.jpg",
      short: "Complete house-warming ceremony to sanctify your new home before moving in.",
      description:
        "Gruhapravesam is the traditional house-warming ceremony performed before living in a new home. It usually includes Ganapathi Pooja, Punyahavachanam, Vastu Shanti, Navagraha Pooja and the ritual of boiling milk, to bring peace and prosperity to the household.",
      benefits: ["Purifies and blesses the new home", "Removes Vastu doshas", "Peace and prosperity for the family"],
      duration: "3 – 4 hours",
      idealFor: "New house, flat or villa",
      price: { home: 15000 },
      samagri: 5000,
      modes: ["home"],
      fields: ["sankalpa"]
    },
    {
      id: "marriage-pooja",
      name: "Marriage Pooja",
      type: "ceremony",
      popular: false,
      image: "images/marriage-pooja.jpg",
      short: "Vedic wedding rituals performed with care, from Nischayam to Kanyadanam.",
      description:
        "Our priests perform complete Vedic marriage ceremonies and related rituals such as Nischayathartham, Vratham, Kashi Yatra, Kanyadanam, Mangalya Dharanam and Saptapadi, following your family's tradition and region.",
      benefits: ["Authentic Vedic wedding rituals", "Customised to your family tradition", "Priests for pre-wedding pujas too"],
      duration: "As per muhurtham",
      idealFor: "Weddings, engagements, Shashtiabdapoorthi",
      price: { home: 25000 },
      samagri: 8000,
      modes: ["home"],
      fields: ["sankalpa"]
    },
    {
      id: "special-pujas",
      name: "Other Special Pujas",
      type: "ceremony",
      popular: false,
      image: "images/special-pujas.jpg",
      short: "Rudrabhishekam, Varalakshmi Vratham, Mrityunjaya Homam and more on request.",
      description:
        "Looking for something specific? We arrange many other pujas and rituals including Rudrabhishekam, Mrityunjaya Homam, Chandi Homam, Varalakshmi Vratham and Vahana Pooja. Book a slot and tell us your requirement in the special instructions – our Pandit will confirm the details with you.",
      benefits: ["Wide range of pujas and rituals", "Guidance on the right puja", "Arranged as per your tradition"],
      duration: "Varies",
      idealFor: "Any special requirement",
      price: { online: 2500, home: 5500 },
      samagri: 2000,
      modes: ["online", "home"],
      fields: ["sankalpa"]
    }
  ],

  /* ---------- Special occasions ---------- */
  occasions: [
    { title: "New Home / Gruhapravesam", text: "Gruhapravesam, Vastu Shanti and Ganapathi Homam.", puja: "gruhapravesam", icon: "home" },
    { title: "Birthday", text: "Ayushya Homam and birth-star pujas for long life.", puja: "ayushya-homam", icon: "cake" },
    { title: "Marriage", text: "Complete Vedic wedding and pre-wedding rituals.", puja: "marriage-pooja", icon: "rings" },
    { title: "Business Opening", text: "Ganapathi Homam and Lakshmi Pooja for success.", puja: "ganapathi-homam", icon: "shop" },
    { title: "Festivals", text: "Diwali, Navaratri, Vinayaka Chaturthi and more.", puja: "lakshmi-pooja", icon: "diya" },
    { title: "Family Well-being", text: "Sudarshana and Navagraha Homam for peace and protection.", puja: "sudarshana-homam", icon: "family" }
  ],

  /* ---------- Testimonials ---------- */
  testimonials: [
    {
      name: "Lakshmi Narayanan",
      place: "Chennai",
      puja: "Gruhapravesam",
      text: "The priests arrived on time with all the samagri and explained every step to us. Our Gruhapravesam was peaceful and exactly as our elders wanted."
    },
    {
      name: "Priya Raghavan",
      place: "Bengaluru",
      puja: "Ayushya Homam",
      text: "We booked the Ayushya Homam for our son's first birthday. Very smooth from enquiry to completion, and the mantras were chanted beautifully."
    },
    {
      name: "Suresh Iyer",
      place: "Hyderabad",
      puja: "Ganapathi Homam",
      text: "I enquired on WhatsApp in the morning and they had everything arranged for our office opening the same week. Highly recommended."
    },
    {
      name: "Anand Krishnan",
      place: "New Jersey, USA",
      puja: "Thithi (Online)",
      text: "Living in the US, I worried about doing my father's thithi properly. The Pandit did it live on video at a time that suited us, and the prasadam reached us in two weeks."
    }
  ],

  /* ---------- Cities where Pandits visit homes ----------
     travel: travel charge added to at-home bookings in that city (₹) */
  cities: [
    { name: "Chennai", state: "Tamil Nadu", travel: 0, active: true },
    { name: "Bengaluru", state: "Karnataka", travel: 500, active: true },
    { name: "Hyderabad", state: "Telangana", travel: 500, active: true },
    { name: "Coimbatore", state: "Tamil Nadu", travel: 300, active: true },
    { name: "Madurai", state: "Tamil Nadu", travel: 300, active: true },
    { name: "Tiruchirappalli", state: "Tamil Nadu", travel: 300, active: true },
    { name: "Kochi", state: "Kerala", travel: 600, active: true },
    { name: "Mumbai", state: "Maharashtra", travel: 800, active: true },
    { name: "Pune", state: "Maharashtra", travel: 800, active: true },
    { name: "Delhi NCR", state: "Delhi", travel: 1000, active: true }
  ],

  /* ---------- Countries (for NRI online pujas) ----------
     rate: approximate value of ₹1 in the local currency (shown as "approx.")
     prasadam: whether Prasadam can be shipped there, the charge (₹) and time */
  countries: [
    { code: "IN", name: "India", dial: "+91", currency: "INR", rate: 1, zones: [["Asia/Kolkata", "India (IST)"]], prasadam: { available: true, charge: 250, days: "3 – 5 days" } },
    { code: "US", name: "USA", dial: "+1", currency: "USD", rate: 0.012, zones: [["America/New_York", "Eastern"], ["America/Chicago", "Central"], ["America/Denver", "Mountain"], ["America/Los_Angeles", "Pacific"]], prasadam: { available: true, charge: 2500, days: "10 – 15 business days" } },
    { code: "GB", name: "United Kingdom", dial: "+44", currency: "GBP", rate: 0.0094, zones: [["Europe/London", "UK time"]], prasadam: { available: true, charge: 1800, days: "7 – 12 business days" } },
    { code: "CA", name: "Canada", dial: "+1", currency: "CAD", rate: 0.016, zones: [["America/Toronto", "Eastern (Toronto)"], ["America/Edmonton", "Mountain (Calgary)"], ["America/Vancouver", "Pacific (Vancouver)"]], prasadam: { available: true, charge: 2500, days: "10 – 15 business days" } },
    { code: "AU", name: "Australia", dial: "+61", currency: "AUD", rate: 0.018, zones: [["Australia/Sydney", "Sydney / Melbourne"], ["Australia/Brisbane", "Brisbane"], ["Australia/Perth", "Perth"]], prasadam: { available: true, charge: 2500, days: "10 – 15 business days" } },
    { code: "AE", name: "UAE", dial: "+971", currency: "AED", rate: 0.044, zones: [["Asia/Dubai", "UAE time"]], prasadam: { available: true, charge: 1200, days: "5 – 7 business days" } },
    { code: "SG", name: "Singapore", dial: "+65", currency: "SGD", rate: 0.016, zones: [["Asia/Singapore", "Singapore time"]], prasadam: { available: true, charge: 1500, days: "5 – 8 business days" } },
    { code: "NZ", name: "New Zealand", dial: "+64", currency: "NZD", rate: 0.02, zones: [["Pacific/Auckland", "NZ time"]], prasadam: { available: true, charge: 2800, days: "12 – 18 business days" } },
    { code: "DE", name: "Germany", dial: "+49", currency: "EUR", rate: 0.011, zones: [["Europe/Berlin", "Central European"]], prasadam: { available: true, charge: 2200, days: "8 – 14 business days" } },
    { code: "MY", name: "Malaysia", dial: "+60", currency: "MYR", rate: 0.053, zones: [["Asia/Kuala_Lumpur", "Malaysia time"]], prasadam: { available: true, charge: 1500, days: "6 – 10 business days" } },
    { code: "QA", name: "Qatar", dial: "+974", currency: "QAR", rate: 0.044, zones: [["Asia/Qatar", "Qatar time"]], prasadam: { available: true, charge: 1300, days: "6 – 9 business days" } },
    { code: "SA", name: "Saudi Arabia", dial: "+966", currency: "SAR", rate: 0.045, zones: [["Asia/Riyadh", "Saudi time"]], prasadam: { available: false, charge: 0, days: "Not available (customs rules)" } },
    // Any other country. Keep this last. Its time zone is taken from the
    // customer's device, and Prasadam delivery is confirmed on the call.
    { code: "XX", name: "Other country", dial: "", currency: "USD", rate: 0.012, zones: [], other: true, prasadam: { available: true, charge: 3000, days: "Confirmed on the call" } }
  ],

  /* ---------- Booking rules ---------- */
  booking: {
    // Puja start times, in Indian time (IST). Pandits are booked per slot.
    slots: ["05:30", "07:00", "08:30", "10:00", "11:30", "16:00", "17:30", "19:00"],
    // How long a Pandit is busy for one booking (minutes). At-home bookings
    // include travel time.
    busyMinutes: { online: 120, home: 240 },
    // Minimum notice before a puja can be booked (hours)
    leadHours: { online: 12, home: 24 },
    // How far ahead customers can book (days)
    maxDaysAhead: 120,
    languages: ["Tamil", "Telugu", "Kannada", "Malayalam", "Hindi", "Sanskrit only"],
    // Cancellation refund: hours before the puja → % refunded
    refundPolicy: [
      { hours: 48, percent: 100 },
      { hours: 24, percent: 50 }
    ],
    rescheduleHours: 24 // reschedule allowed until this many hours before
  },

  /* ---------- Pandits (sample) ----------
     weeklyOff: days off (0 = Sunday … 6 = Saturday) */
  pandits: [
    { id: "pd1", name: "Sri Venkatesa Sastrigal", experience: 24, languages: ["Tamil", "Sanskrit only"], modes: ["online", "home"], cities: ["Chennai", "Tiruchirappalli"], weeklyOff: [], blocked: [], active: true },
    { id: "pd2", name: "Sri Ramakrishna Ghanapaadigal", experience: 31, languages: ["Tamil", "Telugu"], modes: ["online", "home"], cities: ["Chennai", "Coimbatore", "Madurai"], weeklyOff: [2], blocked: [], active: true },
    { id: "pd3", name: "Sri Subrahmanya Sharma", experience: 18, languages: ["Kannada", "Telugu", "Hindi"], modes: ["online", "home"], cities: ["Bengaluru", "Hyderabad"], weeklyOff: [], blocked: [], active: true },
    { id: "pd4", name: "Sri Narayana Namboothiri", experience: 20, languages: ["Malayalam", "Tamil"], modes: ["home"], cities: ["Kochi", "Coimbatore"], weeklyOff: [3], blocked: [], active: true },
    { id: "pd5", name: "Sri Hariharan Vadhyar", experience: 15, languages: ["Tamil", "Hindi"], modes: ["online", "home"], cities: ["Mumbai", "Pune"], weeklyOff: [], blocked: [], active: true },
    { id: "pd6", name: "Sri Shankar Dikshitar", experience: 27, languages: ["Tamil", "Sanskrit only", "Hindi"], modes: ["online", "home"], cities: ["Delhi NCR"], weeklyOff: [1], blocked: [], active: true },
    { id: "pd7", name: "Sri Srinivasa Acharya", experience: 12, languages: ["Telugu", "Kannada"], modes: ["online"], cities: [], weeklyOff: [], blocked: [], active: true }
  ],

  /* ---------- Frequently asked questions ---------- */
  faqs: [
    { q: "Do I pay online?", a: "No. Send us a booking request with your preferred date and time – no payment is needed. We call you to confirm the details, and you pay after the puja, in cash or by UPI / bank transfer." },
    { q: "How does an online puja work?", a: "After we confirm your booking on a call, we send you a video meeting link. At the booked time, join from your phone or computer. The Pandit performs the puja live, takes your sankalpam with your family names and gothram, and guides you when to offer prayers. Prasadam is then shipped to your address." },
    { q: "I live outside India. Can I book?", a: "Yes. Online puja is designed for NRIs. Choose your country and time zone, and we show each slot in your local time. You can pay by bank transfer after the puja, or your family in India can pay us, and Prasadam is shipped to most countries." },
    { q: "Do I need an account to book?", a: "No. Just fill in your name, mobile number and puja details. If you log in, your details are saved so you don't need to type them again next time." },
    { q: "Do you bring the puja samagri for at-home pujas?", a: "Yes, if you add the samagri kit while booking. The kit contains everything for the ritual; you only need to arrange flowers, fruits and a lamp, unless you ask us to." },
    { q: "Can I cancel or change the time?", a: "Yes, from My Bookings on the same phone or computer, or by calling or messaging us on WhatsApp. As no payment is taken in advance, there is no cancellation charge." },
    { q: "How do I know the correct thithi date for Shraddham?", a: "While booking a Thithi, share the date of passing and the relationship. Our Pandits calculate this year's thithi and confirm the date with you before the ceremony." }
  ]
};
