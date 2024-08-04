const puppeteer = require("puppeteer");
const { setupBrowser } = require("./setupBrowser/setupBrowser");
const { delay } = require("./utils/delay");
const { takeInnerText } = require("./helpers/takeInnerText");

async function bonus() {
  const { page } = await setupBrowser();

  // TODO jeśli można głosować - uruchomić sygnał dźwiękowy
  // TODO zablokować inne funkcje!

  try {
    const bonusButton = await page.$("#btn-online-bonus");

    if (bonusButton) {
      await bonusButton.click();
      await delay(2000);
      console.log("Znaleziono bonus!");
    } else {
      console.log("Brak bonusa :(");
    }
  } catch (error) {
    console.error("Wystąpił błąd w bonus.js:", error);
  }

  await delay(3000);
}

module.exports = { bonus };
