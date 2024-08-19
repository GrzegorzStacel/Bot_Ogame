import { ElementHandle, HTTPResponse } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";

export async function navigationUtils(pathSelector: string): Promise<void> {
  try {
    const { page } = await setupBrowser();

    if (page) {
      await page.waitForSelector(pathSelector);
      const pageElement: ElementHandle<Element> | null = await page.$(pathSelector);

      const navigationPromise: Promise<HTTPResponse> = page.waitForNavigation();

      await pageElement.click();

      await navigationPromise;
    } else {
      console.log("Nie znaleziono elementu nawigacyjnego.");
      return;
    }
  } catch (error) {
    console.error(`Wystąpił błąd: ${error.message}`);
    console.error(`Szczegóły błędu: ${error.stack}`);
  }
}
