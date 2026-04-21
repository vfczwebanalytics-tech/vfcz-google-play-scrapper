import gplay from "./index.js";
import fs from "fs";
import { segmentReview } from "./review-segmenter.js";

function removeDiacritics(text = "") {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const mainAppId = "com.vodafone.core.digiopcocz.react";
const secondAppId = "com.zentity.vodafone";
const country = "cz";

const dataFile = "vodafone-google-play-reviews.json";
const backupFile = "vodafone-google-play-reviews (copy).json";

async function main() {
  if (fs.existsSync(dataFile)) {
    fs.copyFileSync(dataFile, backupFile);
    console.log(`📁 Backup created: ${backupFile}`);
  }

  let existingReviews = [];
  let existingRatings = {};
  if (fs.existsSync(dataFile)) {
    try {
      const raw = fs.readFileSync(dataFile, "utf-8");
      const parsed = JSON.parse(raw);
      existingReviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
      existingRatings = parsed.ratings || {};
      console.log(`ℹ️ Načítaných ${existingReviews.length} existujúcich recenzií`);
    } catch (err) {
      console.warn("⚠️ Chyba pri načítaní existujúceho súboru, začíname od nuly");
      existingReviews = [];
      existingRatings = {};
    }
  }

  try {
    const secondAppData = await gplay.app({ appId: secondAppId, country, lang: "cs" });
    console.log("============================================");
    console.log(`📱 Stará aplikace: ${secondAppId}`);
    console.log(`⭐ Celkové hodnocení: ${secondAppData.score.toFixed(2)} / 5`);
    console.log("============================================\n");
  } catch (err) {
    console.error(`❌ Nepodarilo sa načítať dáta pre ${secondAppId}:`, err.message);
  }

  const appData = await gplay.app({ appId: mainAppId, country, lang: "cs" });
  console.log(`📱 App: ${mainAppId}`);
  console.log(`⭐ Overall score: ${appData.score.toFixed(2)} / 5`);
  console.log(`📝 Total reviews: ${appData.reviews}`);
  console.log("=".repeat(60));

  let nextToken = null;
  const newReviews = [];
  const existingIds = new Set(existingReviews.map((r) => r.id));
  let pageCount = 0;

  console.log("Fetching reviews page by page...");

  do {
    pageCount++;
    console.log(`Fetching page ${pageCount}...`);

    const reviewData = await gplay.reviews({
      appId: mainAppId,
      country,
      lang: "cs",
      sort: gplay.sort.NEWEST,
      paginate: true,
      nextPaginationToken: nextToken,
    });

    const fresh = reviewData.data.filter((r) => !existingIds.has(r.id));
    console.log(`  Retrieved ${reviewData.data.length} reviews, new: ${fresh.length}`);

    // ✅ Stop early if no new reviews on this page — deeper pages won't have any either
    if (fresh.length === 0) {
      console.log("  No new reviews on this page, stopping pagination.");
      break;
    }

    fresh.forEach((review) => {
      const originalText = review.text || "";
      const normalizedText = removeDiacritics(originalText).toLowerCase();

      newReviews.push({
        id: review.id,
        userName: review.userName,
        date: review.date,
        score: review.score,
        text: originalText,
        text_normalized: normalizedText,
        segments: segmentReview(normalizedText),
        replyDate: review.replyDate || null,
        replyText: review.replyText || null,
        version: review.version || null,
      });
    });

    nextToken = reviewData.nextPaginationToken;
    if (nextToken) await new Promise((r) => setTimeout(r, 1000));
  } while (nextToken && pageCount < 100); // ✅ Raised from 20 to 100

  console.log(`✅ Celkovo nových recenzií: ${newReviews.length}`);

  const allReviews = [...newReviews, ...existingReviews];

  const output = {
    ratings: {
      score: appData.score,
      scoreText: appData.scoreText || null,
      totalRatings: appData.ratings,
      totalReviews: appData.reviews,
      histogram: appData.histogram || {},
    },
    reviews: allReviews,
    metadata: {
      totalReviewsExtracted: allReviews.length,
      extractedAt: new Date().toISOString(),
      source: "google-play",
    },
  };

  fs.writeFileSync(dataFile, JSON.stringify(output, null, 2));
  console.log(`📄 Výstup uložený do: ${dataFile}`);
  console.log("✅ Segmentácia a doplnenie nových recenzií dokončené!");
}

main().catch((err) => console.error("❌ Error:", err));
