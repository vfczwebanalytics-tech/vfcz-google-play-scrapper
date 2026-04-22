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
  // 🔹 Backup
  if (fs.existsSync(dataFile)) {
    fs.copyFileSync(dataFile, backupFile);
    console.log(`📁 Backup created: ${backupFile}`);
  }

  // 🔹 Load existing data
  let existingReviews = [];
  let existingRatings = {};

  if (fs.existsSync(dataFile)) {
    try {
      const raw = fs.readFileSync(dataFile, "utf-8");
      const parsed = JSON.parse(raw);
      existingReviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
      existingRatings = parsed.ratings || {};
      console.log(`ℹ️ Loaded ${existingReviews.length} existing reviews`);
    } catch (err) {
      console.warn("⚠️ Error reading file, starting fresh");
    }
  }

  // 🔹 Latest known date
  const latestDate = existingReviews.length
    ? new Date(existingReviews[0].date)
    : new Date(0);

  const existingIds = new Set(existingReviews.map((r) => r.id));

  // 🔹 App info
  const appData = await gplay.app({
    appId: mainAppId,
    country,
    lang: "cs",
  });

  console.log(`📱 App: ${mainAppId}`);
  console.log(`⭐ Score: ${appData.score}`);
  console.log("=".repeat(50));

  let nextToken = null;
  let pageCount = 0;
  let emptyPagesInRow = 0;

  const collected = [];

  console.log("🚀 Fetching reviews...");

  do {
    pageCount++;

    const reviewData = await gplay.reviews({
      appId: mainAppId,
      country,
      lang: "cs",
      sort: gplay.sort.NEWEST,
      paginate: true,
      nextPaginationToken: nextToken,
    });

    const fresh = reviewData.data.filter((r) => {
      const isNewId = !existingIds.has(r.id);
      const isNewDate = new Date(r.date) > latestDate;
      return isNewId && isNewDate;
    });

    console.log(
      `📄 Page ${pageCount}: total=${reviewData.data.length}, new=${fresh.length}`
    );

    if (fresh.length === 0) {
      emptyPagesInRow++;
    } else {
      emptyPagesInRow = 0;
    }

    // 🔥 stop after X empty pages
    if (emptyPagesInRow >= 3) {
      console.log("🛑 Stopping after 3 empty pages in a row");
      break;
    }

    fresh.forEach((review) => {
      const originalText = review.text || "";
      const normalizedText = removeDiacritics(originalText).toLowerCase();

      collected.push({
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

    if (nextToken) {
      await new Promise((r) => setTimeout(r, 1000)); // anti-rate-limit
    }
  } while (nextToken && pageCount < 50); // limit safety

  console.log(`✅ New reviews collected: ${collected.length}`);

  // 🔹 Merge + deduplicate (extra safety)
  const mergedMap = new Map();

  [...collected, ...existingReviews].forEach((r) => {
    mergedMap.set(r.id, r);
  });

  const allReviews = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

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

  console.log(`📄 Saved to: ${dataFile}`);
  console.log("🎉 Done!");
}

main().catch((err) => console.error("❌ Error:", err));
