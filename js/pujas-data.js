/* =====================================================================
   AGNI PUJA – SITE CONTENT
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to change content on the
   homepage. No coding knowledge is needed – just copy an existing
   block, paste it, and change the text.

   HOW TO ADD A NEW PUJA
   1. Copy one { ... } block inside the `pujas` list below.
   2. Paste it after the last one (keep the comma between blocks).
   3. Give it a unique `id` (lowercase, no spaces, e.g. "rudra-homam").
   4. Set `type` to "homam", "pooja" or "ceremony".
   5. Set `popular: true` if it should also appear under "Popular Homams".
   6. Put a photo in the /images folder (or use a web link) and set `image`.
   That's it – the card, details popup and enquiry form update themselves.
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
    social: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/"
    }
  },

  /* ---------- Pujas & Homams ---------- */
  pujas: [
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
      idealFor: "New beginnings, business, house warming"
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
      idealFor: "Diwali, Fridays, new business"
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
      idealFor: "Horoscope doshas, Shani / Rahu periods"
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
      idealFor: "Birthdays, first birthday, elders"
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
      idealFor: "Protection, health concerns, new home"
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
      idealFor: "Students, Vidyarambham, Navaratri"
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
      idealFor: "Pournami, house warming, family events"
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
      idealFor: "New house, flat or villa"
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
      idealFor: "Weddings, engagements, Shashtiabdapoorthi"
    },
    {
      id: "special-pujas",
      name: "Other Special Pujas",
      type: "ceremony",
      popular: false,
      image: "images/special-pujas.jpg",
      short: "Rudrabhishekam, Varalakshmi Vratham, Shraddham and more on request.",
      description:
        "Looking for something specific? We arrange many other pujas and rituals including Rudrabhishekam, Mrityunjaya Homam, Chandi Homam, Varalakshmi Vratham, Vahana Pooja, Shraddham, Tarpanam and Upanayanam. Tell us your requirement and we will guide you.",
      benefits: ["Wide range of pujas and rituals", "Guidance on the right puja", "Arranged as per your tradition"],
      duration: "Varies",
      idealFor: "Any special requirement"
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
    }
  ]
};
