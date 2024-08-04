const { setupBrowser } = require("../setupBrowser/setupBrowser");

// Element musi być stringiem!
async function takeInnerText(element, isSlice = false) {
  const { page } = await setupBrowser();

  try {
    // Sprawdzenie czy element jest stringiem
    if (typeof element !== "string") {
      throw new TypeError("'Element' musi być typu string");
    }

    const serchingElement = await page.$(element);

    if (!serchingElement) {
      console.log("Brak elementu serchingElement: ", serchingElement);
      return null;
    }

    const text = await page.evaluate((el) => el.innerText, serchingElement);
    // console.log("text::: ", text);

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

  return null;
}

module.exports = { takeInnerText };
