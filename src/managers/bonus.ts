import { ElementHandle } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { delay } from "../utils/delay.js";

export async function bonus(): Promise<void> {
  const { page } = await setupBrowser();

  try {
    const bonusButton: ElementHandle<Element> = await page.$("#btn-online-bonus");

    if (bonusButton) {
      await bonusButton.click();

      await delay(2000);

      console.log("Otrzymano bonus!");
    } else {
      console.log("Brak bonusa.");
    }
  } catch (error) {
    console.error("Wystąpił błąd w bonus.js:", error);
  }
}
