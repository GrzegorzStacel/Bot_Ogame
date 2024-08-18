import { setupBrowser } from "./setupBrowser/setupBrowser.js";
import { bonus } from "./managers/bonus.js";
import { delay } from "./utils/delay.js";
import { searchingPlanetsInGalaxy } from "./managers/searchingPlanetsInGalaxy.js";
import { farmManager } from "./managers/farmManager.js";

(async () => {
  const { page } = await setupBrowser();

  // Zmienna zarządzająca akcjami aby każda z nich odbywała się jednocześnie
  let isActualWorking = false;

  while (true) {
    if (!isActualWorking) {
      isActualWorking = true;
      await bonus();
      isActualWorking = false;
    }

    //TODO Dodać datę, do pliku, kiedy były skanowane systemy. Uruchamiając dwa lub więcej razy dziennie skrypt, bez takiej informacji, spowoduje, że niepotrzebnie będzie skanował najbliższą okolicę.
    if (!isActualWorking) {
      isActualWorking = true;
      // await searchingPlanetsInGalaxy();
      isActualWorking = false;
    }

    if (!isActualWorking) {
      isActualWorking = true;
      await farmManager(page);
      isActualWorking = false;
    }

    await delay(15000);
  }
})();
