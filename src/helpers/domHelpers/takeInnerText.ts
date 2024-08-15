import { ElementHandle } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";

// Element musi być stringiem!
export async function takeInnerText(element: string, isSlice: boolean = false) {
  const { page } = await setupBrowser();

  try {
    // Sprawdzenie czy element jest stringiem
    if (typeof element !== "string") {
      throw new TypeError("'Element' musi być typu string");
    }

    const serchingElement: ElementHandle | null = await page.$(element);

    if (!serchingElement) {
      console.log("Brak elementu serchingElement: ", serchingElement);
      return null;
    }

    const text: string = await page.evaluate((el: HTMLElement) => el.innerText, serchingElement);

    if (isSlice) {
      // Wyciągnięcie ostatnich dwóch znaków, ponieważ podczas pobierania lvl jest "Level: 50"
      const lastTwoChars = text.slice(-2);
      return lastTwoChars;
    }

    return text;
  } catch (error) {
    console.error("Błąd w pliku takeInnerText.js: ", error);
    throw error;
  }
}
