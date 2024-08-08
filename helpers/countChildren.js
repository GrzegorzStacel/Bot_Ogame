import puppeteer from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";

export async function getChildrenCount(parentSelector) {
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
