const puppeteer = require("puppeteer");
const { setupBrowser } = require("../setupBrowser/setupBrowser");
const { delay } = require("../utils/delay");

async function build(building) {
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

module.exports = { build };
