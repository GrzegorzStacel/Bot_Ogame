import puppeteer from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { delay } from "../../utils/delay.js";

export async function build(building) {
  const { page } = await setupBrowser();

  try {
    const findBuildingButton = await page.$(building);

    if (findBuildingButton) {
      await findBuildingButton.click();
      console.log(`Wcisnołem przycisk budowania: ${building}!`);
      await delay();
    } else {
      console.log(`Nie znalazłem przycisku do budowania: ${building}!`);
      return;
    }
  } catch (error) {
    console.error("Error w build.js: ", error);
  }

  return;
}
