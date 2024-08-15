import { setupBrowser } from "./setupBrowser/setupBrowser.js";
import { bonus } from "./managers/bonus.js";
import { delay } from "./utils/delay.js";
import { searchingPlanetsInGalaxy } from "./managers/searchingPlanetsInGalaxy.js";
import { farmManager } from "./managers/farmManager.js";

(async () => {
  await setupBrowser();
  await delay();

  // Zmienna zarządzająca akcjami aby każda z nich odbywała się jednocześnie
  let isActualWorking = false;

  while (true) {
    if (!isActualWorking) {
      isActualWorking = true;
      await bonus();
      isActualWorking = false;
    }

    if (!isActualWorking) {
      isActualWorking = true;
      await searchingPlanetsInGalaxy();
      isActualWorking = false;
    }

    if (!isActualWorking) {
      isActualWorking = true;
      await farmManager();
      isActualWorking = false;
    }

    await delay(15000);
  }
})();
