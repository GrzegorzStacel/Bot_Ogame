const puppeteer = require("puppeteer");
const { setupBrowser } = require("./setupBrowser/setupBrowser");
const { bonus } = require("./bonus");
const { promoteSerwer } = require("./promoteSerwer");
const { delay } = require("./utils/delay");
const { build } = require("./helpers/build");
const buildings = require("./helpers/listOfBuildings/listOfBuildings");
const { takeInnerText } = require("./helpers/takeInnerText");
const { buildManager } = require("./managers/buildManager");
const { checkSpyMessages } = require("./managers/checkSpyMessages");
const { searchingPlanetsInGalaxy } = require("./managers/searchingPlanetsInGalaxy");
const { farmManager } = require("./managers/farmManager");
const { checkSlotsOfFleet } = require("./helpers/checkSlotsOfFleet");

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
