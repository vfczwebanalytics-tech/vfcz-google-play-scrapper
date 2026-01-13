import gplay from "./index.js";
import fs from "fs";

// Pôvodný súbor
const originalFile = "vodafone-google-play-reviews.json";
// Názov záložnej kópie
const backupFile = "vodafone-google-play-reviews (copy).json";

async function main() {
  // === Dodatočné hodnotenie pre ďalšiu appku ===
  const secondAppId = "com.zentity.vodafone";
  try {
    const secondAppData = await gplay.app({
      appId: secondAppId,
      country: "cz",
      lang: "cs",
    });

    console.log("============================================");
    console.log(`📱 Stará aplikace: ${secondAppId}`);
    console.log(`⭐ Celkové hodnocení: ${secondAppData.score.toFixed(2)} / 5`);
    console.log("============================================");
  } catch (err) {
    console.error(
      `❌ Nepodarilo sa načítať dáta pre ${secondAppId}:`,
      err.message,
    );
  }

  // === KROK 1: Vymazať starú kópiu, ak existuje ===
  if (fs.existsSync(backupFile)) {
    fs.unlinkSync(backupFile);
    console.log(`🗑️ Deleted old backup: ${backupFile}`);
  }

  // === KROK 2: Ak existuje pôvodný súbor, vytvoriť novú kópiu ===
  if (fs.existsSync(originalFile)) {
    fs.copyFileSync(originalFile, backupFile);
    console.log(`📁 Backup created: ${backupFile}`);
  } else {
    console.log("⚠️ No original file found — skipping backup.");
  }

  const appId = "com.vodafone.core.digiopcocz.react";

  console.log("Extracting ALL reviews for:", appId);
  console.log("=".repeat(60));

  const { appData, allReviews } = await getAllReviews();

  const output = {
    ratings: {
      score: appData.score,
      scoreText: appData.scoreText,
      totalRatings: appData.ratings,
      totalReviews: appData.reviews,
      histogram: appData.histogram,
    },
    reviews: allReviews.map((review) => ({
      userName: review.userName,
      date: review.date,
      score: review.score,
      text: review.text,
      replyDate: review.replyDate || null,
      replyText: review.replyText || null,
      version: review.version || null,
    })),
    metadata: {
      totalReviewsExtracted: allReviews.length,
      extractedAt: new Date().toISOString(),
    },
  };

  fs.writeFileSync(originalFile, JSON.stringify(output, null, 2));

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Successfully extracted ALL reviews!`);
  console.log(`📄 Saved to: ${originalFile}`);
  console.log(`${"=".repeat(60)}`);
}

async function getAllReviews() {
  const appId = "com.vodafone.core.digiopcocz.react";
  const allReviews = [];
  let nextToken = null;
  let pageCount = 0;

  const appData = await gplay.app({ appId, country: "cz", lang: "cs" });
  console.log(`Total reviews available: ${appData.reviews}`);
  console.log("\nFetching reviews page by page (in Czech language)...\n");

  do {
    pageCount++;
    console.log(`Fetching page ${pageCount}...`);

    const reviewData = await gplay.reviews({
      appId,
      country: "cz",
      lang: "cs",
      sort: gplay.sort.NEWEST,
      paginate: true,
      nextPaginationToken: nextToken,
    });

    console.log(`  Retrieved ${reviewData.data.length} reviews`);
    allReviews.push(...reviewData.data);
    nextToken = reviewData.nextPaginationToken;

    if (nextToken) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (nextToken && pageCount < 20);

  return { appData, allReviews };
}

// Spusti všetko korektne v poradí
main().catch((err) => console.error(err));
