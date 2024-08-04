const puppeteer = require("puppeteer");
const { setupBrowser } = require("../setupBrowser/setupBrowser");

async function getChildrenCount(parentSelector) {
  const { page } = await setupBrowser();

  return await page.evaluate((selector) => {
    const parentElement = document.querySelector(selector);

    if (parentElement) {
      return parentElement.children.length;
    } else {
      return 0;
    }
  }, parentSelector);
}

module.exports = { getChildrenCount };
