import puppeteer, { ElementHandle, HTTPResponse } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import fs from "fs/promises";
import { delay } from "../utils/delay.js";
import { writeDataToFile } from "../helpers/writeDataToFile.js";
import { getRandomNumber } from "../helpers/getRandomNumber.js";

export async function searchingPlanetsInGalaxy() {
  const { page } = await setupBrowser();
  const maxNumberOfSystem = 499;
  let galaxyPage: ElementHandle<HTMLAnchorElement>;

  if (page) {
    galaxyPage = await page.$("a[href='/galaxy']");
    const navigationPromise: Promise<HTTPResponse> = page.waitForNavigation();

    await galaxyPage.click();

    await navigationPromise;

    await delay(getRandomNumber(2000, 3000));
  } else {
    console.log("Nie znaleziono przycisku z galaktyką!", galaxyPage);
    return;
  }

  let arrayWithCoordinatesToInactivePlanets: [string, string, string][] = [];

  const galaxyInputElement: ElementHandle<Element> = await page.$(".galaxy-route #galaxyInput");
  const galaxyInputValue: string = await page.evaluate((input: HTMLInputElement) => input.value, galaxyInputElement);

  for (let i = 0; i < 500; i++) {
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
      await delay(getRandomNumber(800, 1200));

      await buttonToChangeSystem.click();

      // Czekaj na załadowanie się nowego systemu
      await page.waitForSelector("#systemInput", { visible: true });

      // Daje trochę dodatkowego czasu aby elementy DOM'u w pełni się załadowały
      await delay();

      if (Number(systemInputValue) === maxNumberOfSystem) {
        break;
      }
    } catch (error) {
      console.error("Wystąpił błąd:", error);
    }
  }

  // Zapisz wyniki do pliku
  await writeDataToFile("data/farmCoordinates.json", arrayWithCoordinatesToInactivePlanets);
}

function addCoordinatesToArray(array: string[][], galaxy: string, system: string, position: string) {
  // Tworzymy tablicę z trzema wartościami
  const coordinates = [galaxy, system, position];

  // Dodajemy tablicę do głównej tablicy
  array.push(coordinates);
  console.log("coordinates::: ", coordinates);
}
