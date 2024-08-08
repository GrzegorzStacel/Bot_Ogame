import puppeteer from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";

export async function countSiblings(parentSelector) {
  const { page } = await setupBrowser();

  return await page.evaluate((selector) => {
    const parentElement = document.querySelector(selector);
    if (parentElement) {
      const firstChild = parentElement.firstElementChild;
      if (firstChild) {
        // Liczba rodzeństwa to liczba dzieci
        return parentElement.children.length;
      } else {
        return 0; // Jeśli brak pierwszego dziecka
      }
    } else {
      return 0; // Jeśli brak elementu rodzica
    }
  }, parentSelector);
}
