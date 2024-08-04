const puppeteer = require("puppeteer");
const { setupBrowser } = require("../setupBrowser/setupBrowser");
const fs = require("fs").promises;
const { delay } = require("../utils/delay");
const { writeDataToFile } = require("../helpers/writeDataToFile");

async function searchingPlanetsInGalaxy() {
  const { page } = await setupBrowser();

  if (page) {
    const galaxyPage = await page.$("a[href='/galaxy']");
    const navigationPromise = page.waitForNavigation();

    await galaxyPage.click();

    await navigationPromise;

    await delay(3000);
  } else {
    console.log("Nie znaleziono przycisku z galaktyką!", galaxyPage);
    return;
  }

  let arrayWithCoordinatesToInactivePlanets = [];

  const galaxyInputElement = await page.$(".galaxy-route #galaxyInput");
  const galaxyInputValue = await page.evaluate((input) => input.value, galaxyInputElement);

  for (let i = 0; i < 31; i++) {
    try {
      let buttonToChangeSystem = await page.$("#btnSystemRight");

      let systemInputElement = await page.$("#systemInput");
      let systemInputValue = await page.evaluate((input) => input.value, systemInputElement);

      let planetsPositionElement = await page.$$(".galaxy-info .filterInactive .col-planet-index span");

      for (let element of planetsPositionElement) {
        const planetPositionText = await page.evaluate((el) => el.innerText, element);

        // Dodanie obecnej rundy do głównej tablicy
        addCoordinatesToArray(arrayWithCoordinatesToInactivePlanets, galaxyInputValue, systemInputValue, planetPositionText);
      }

      // Symulowanie przechodzenia przez systemy, jak przez człowieka aby szybkość reakcji była różna
      await delay(getRandomNumber(800, 1200));

      await buttonToChangeSystem.click();

      // Czekaj na załadowanie się nowego systemu
      await page.waitForSelector("#systemInput", { visible: true });

      // Daje trochę dodatkowego czasu aby elementy DOM'u w pełni się załadowały
      await delay();
    } catch (error) {
      console.error("Wystąpił błąd:", error);
    }
  }

  // Zapisz wyniki do pliku
  await writeDataToFile("data/farmCoordinates.json", arrayWithCoordinatesToInactivePlanets);

  // try {
  //   const filePath = "data/farmCoordinates.json";

  //   const existingData = await fs.readFile(filePath, "utf8").catch(() => "[]");
  //   const existingArray = JSON.parse(existingData);

  //   // Połącz istniejące dane z nowymi
  //   console.log("arrayWithCoordinatesToInactivePlanets::: ", arrayWithCoordinatesToInactivePlanets);
  //   const updatedArray = existingArray.concat(arrayWithCoordinatesToInactivePlanets);

  //   // Zapisz zaktualizowaną tablicę do pliku
  //   await fs.writeFile(filePath, JSON.stringify(updatedArray, null, 2));

  //   console.log("Dane zostały zapisane do pliku.");
  // } catch (error) {
  //   console.error("Wystąpił błąd podczas zapisu danych:", error);
  // }
}

module.exports = { searchingPlanetsInGalaxy };

function addCoordinatesToArray(array, galaxy, system, position) {
  // Tworzymy tablicę z trzema wartościami
  const coordinates = [galaxy, system, position];

  // Dodajemy tablicę do głównej tablicy
  array.push(coordinates);
  console.log("coordinates::: ", coordinates);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
