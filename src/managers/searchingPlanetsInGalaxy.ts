import { ElementHandle, HTTPResponse } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { delay } from "../utils/delay.js";
import { writeDataToJsonFile } from "../helpers/fileHelpers/writeDataToJsonFile.js";
import { getRandomNumber } from "../helpers/randomHelpers/getRandomNumber.js";
import { navigationUtils } from "../utils/navigationUtils.js";
import { navigationPaths } from "../config/settings.js";

export async function searchingPlanetsInGalaxy() {
  const { page } = await setupBrowser();
  const maxNumberOfSystem = 499;
  await navigationUtils(navigationPaths.galaxyPath);

  let arrayWithCoordinatesToInactivePlanets: [string, string, string][] = [];

  const galaxyInputElement: ElementHandle<Element> = await page.$(".galaxy-route #galaxyInput");
  const galaxyInputValue: string = await page.evaluate((input: HTMLInputElement) => input.value, galaxyInputElement);

  // TODO dodać do wywołania pętle, która przeszukuje systemy "w górę", oraz "w dół"

  // Przeszukiwanie więcej niż 30 systemów, i wysyłanie statków dalej, byłoby zbyt czasochłonne. Brakło by doby, aby do wszystkich znalezionych planet wysłać statki.
  for (let i = 0; i < 30; i++) {
    try {
      let buttonToChangeSystem: ElementHandle<Element> = await page.$("#btnSystemRight");

      let systemInputElement: ElementHandle<Element> = await page.$("#systemInput");
      let systemInputValue: string = await page.evaluate((input: HTMLInputElement) => input.value, systemInputElement);

      let planetsPositionElement: ElementHandle<HTMLSpanElement>[] = await page.$$(".galaxy-info .filterInactive .col-planet-index span");

      for (let element of planetsPositionElement) {
        const planetPositionText: string = await page.evaluate((el: HTMLSpanElement) => el.innerText, element);

        // Dodanie obecnej rundy do głównej tablicy
        addCoordinatesToArray(arrayWithCoordinatesToInactivePlanets, galaxyInputValue, systemInputValue, planetPositionText);
      }

      // Symulowanie przechodzenia przez systemy, jak przez człowieka aby szybkość reakcji była różna
      await delay(getRandomNumber(300, 700));

      await buttonToChangeSystem.click();

      // Czekaj na załadowanie się nowego systemu
      await page.waitForSelector("#systemInput", { visible: true });

      // Daje trochę dodatkowego czasu aby elementy DOM'u w pełni się załadowały
      await delay();

      if (Number(systemInputValue) === maxNumberOfSystem) {
        break;
      }
    } catch (error) {
      console.error(`Wystąpił błąd w searchingPlanetInGalaxy.js: ${error.message}`);
      console.error(`Szczegóły błędu w searchingPlanetInGalaxy.js: ${error.stack}`);
    }
  }

  // Zapisz wyniki do pliku
  await writeDataToJsonFile("src/data/farmCoordinates.json", arrayWithCoordinatesToInactivePlanets);
}

function addCoordinatesToArray(array: string[][], galaxy: string, system: string, position: string) {
  // Tworzymy tablicę z trzema wartościami
  const coordinates = [galaxy, system, position];

  // Dodajemy tablicę do głównej tablicy
  array.push(coordinates);
  console.log("Planeta: ", coordinates);
}
