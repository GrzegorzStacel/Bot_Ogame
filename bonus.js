import puppeteer from "puppeteer";
import { setupBrowser } from "./setupBrowser/setupBrowser.js";
import { delay } from "./utils/delay.js";
import { takeInnerText } from "./helpers/takeInnerText.js";

export async function bonus() {
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
