// review-segmenter.js
// Keyword-based review segmentation for app store reviews
// Input text MUST be lowercase & without diacritics

const SEGMENTS = {
  Vykonnost: [
    "slow",
    "lag",
    "freeze",
    "stuck",
    "loading",
    "long load",
    "speed",
    "fast",
    "response",
    "seka",
    "pomaly",
    "laguje",
    "pomala",
    "rychlost",
    "slozitejsi",
    "tragedie",
  ],

  UI: [
    "ui",
    "interface",
    "design",
    "layout",
    "menu",
    "button",
    "screen",
    "display",
    "grafika",
    "prehled",
    "neprehledny",
    "ovladani",
  ],

  Stabilita: [
    "crash",
    "crashes",
    "pad",
    "pada",
    "spadne",
    "error",
    "chyba",
    "chyby",
    "chybu",
    "bug",
    "issue",
    "problem",
    "nefunguje",
    "does not work",
    "fail",
    "chyb",
    "nejde",
  ],

  Prihlaseni: [
    "login",
    "sign in",
    "sign-in",
    "prihlas",
    "prihlaseni",
    "heslo",
    "password",
    "otp",
    "sms",
    "overenie",
    "overeni",
    "verification",
  ],

  Platba_a_vyuctovani: [
    "payment",
    "pay",
    "platba",
    "zaplatit",
    "karta",
    "card",
    "google pay",
    "apple pay",
    "transakcia",
    "transaction",
    "billing",
    "invoice",
    "faktura",
    "vyuctovanie",
    "uctovanie",
    "poplatok",
    "charge",
    "charged",
    "uctovane",
    "platb",
    "qr",
  ],

  Zakaznicka_podpora: [
    "support",
    "help",
    "customer service",
    "call center",
    "operator",
    "operatora",
    "linka",
    "zakaznicka",
    "podpora",
  ],

  Obmezene_funkce: [
    "feature",
    "funkcia",
    "funkcie",
    "missing",
    "chybaju",
    "nechyba",
    "add",
    "pridat",
    "moznost",
    "option",
    "widget",
    "nelze",
    "nejde",
    "neda se",
    "neni",
    "nefunkcni",
    "neumi",
    "nemuzu",
    "neda sa",
  ],

  Cena: ["cena", "zdrazovani", "drazsi", "zdrazovanie", "price", "expensive"],

  Spokojenost: [
    "uzasna",
    "spokojen",
    "spokojena",
    "spokojna",
    "super",
    "funguje",
    "spokojenost",
  ],
}; // 👈 DÔLEŽITÉ – uzatvorenie SEGMENTS

const NEGATIVE_HINTS = [
  "not",
  "no",
  "never",
  "bad",
  "poor",
  "terrible",
  "broken",
  "nefunguje",
  "zle",
  "hrozne",
  "problem",
];

export function segmentReview(text) {
  if (!text || text.length < 3) return ["Ine"];

  const segments = new Set();

  for (const [segment, keywords] of Object.entries(SEGMENTS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        segments.add(segment);
        break;
      }
    }
  }

  if (segments.size === 0) {
    return ["Ine"];
  }

  return Array.from(segments);
}
