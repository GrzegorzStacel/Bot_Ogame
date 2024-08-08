import puppeteer from "puppeteer";
import { setupBrowser } from "./setupBrowser/setupBrowser.js";
import { bonus } from "./bonus.js";
import { promoteSerwer } from "./promoteSerwer.js";
import { delay } from "./utils/delay.js";
import { build } from "./helpers/build.js";
import { listOfBuildings } from "./data/listOfBuildings.js";
import { takeInnerText } from "./helpers/takeInnerText.js";
import { buildManager } from "./managers/buildManager.js";
import { checkSpyMessages } from "./managers/checkSpyMessages.js";
import { searchingPlanetsInGalaxy } from "./managers/searchingPlanetsInGalaxy.js";
import { farmManager } from "./managers/farmManager.js";
import { checkSlotsOfFleet } from "./helpers/checkSlotsOfFleet.js";

(async () => {
  await setupBrowser();
  await delay();

  // Zmienna zarządzająca akcjami aby każda z nich odbywała się jednocześnie
  let isActualWorking = false;

  while (true) {
    // if (!isActualWorking) {
    //   isActualWorking = true;
    //   await buildManager();
    //   isActualWorking = false;
    // }

    // if (!isActualWorking) {
    //   isActualWorking = true;
    //   await bonus();
    //   isActualWorking = false;
    // }
    // checkSlotsOfFleet();

    if (!isActualWorking) {
      isActualWorking = true;
      await farmManager();
      isActualWorking = false;
    }

    // if (!isActualWorking) {
    //   isActualWorking = true;
    //   await checkSpyMessages();
    //   isActualWorking = false;
    // }

    // if (!isActualWorking) {
    //   isActualWorking = true;
    //   await searchingPlanetsInGalaxy();
    //   isActualWorking = false;
    // }
    await delay(15000);
  }
})();
