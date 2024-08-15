import { ElementHandle, HTTPResponse } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { importantStrings } from "../config/settings.js";
import { takeInnerText } from "../helpers/domHelpers/takeInnerText.js";
import { delay } from "../utils/delay.js";
import { fleetStatistics } from "../data/fleetStatistics.js";
import { sendFleet } from "./sendFleet.js";
import { modifyJsonFile } from "../helpers/fileHelpers/modifyJsonFile.js";

export async function checkSpyMessages(indexActualArray: number) {
  try {
    const { page } = await setupBrowser();
    // TODO Sprawdzić czy sondy nie zostały zniszczone
    let isDone = true;
    let amountOfSpyProbe = 100;
    let cleanCoordinates: number[];
    let isThereDangerOnThePlanet = false;
    const { stringSpy, stringAttack, stringDanger, stringSafe } = importantStrings;

    while (isDone) {
      if (page) {
        await page.waitForSelector("a[href='/messages']");
        const messagesPage: ElementHandle<HTMLAnchorElement> | null = await page.$("a[href='/messages']");
        const navigationPromise: Promise<HTTPResponse> = page.waitForNavigation();

        await messagesPage.click();

        await navigationPromise;
      } else {
        console.log("Nie weszliśmy do strony z wiadomościami!");
        return;
      }

      await page.waitForSelector(".message-head .head-left span a");
      const takeCoordinates = await takeInnerText(".message-head .head-left span a");
      cleanCoordinates = extractCoordinateNumbers(takeCoordinates);

      await page.waitForSelector(".message-content tr:nth-of-type(2) td:last-child span");
      const fleetExistenceString = await takeInnerText(".message-content tr:nth-of-type(2) td:last-child span");
      const fleetCount = extractNumberFromString(fleetExistenceString);

      await page.waitForSelector(".message-content tr:nth-of-type(3) td:last-child span");
      const defenseExistenceString = await takeInnerText(".message-content tr:nth-of-type(3) td:last-child span");
      const defenseExistence = extractNumberFromString(defenseExistenceString);

      // TODO nie jestem w stanie tego przetestować, ponieważ nie znalazłem planety z flotą lub obroną ( jest na planecie [1:471:13])
      if (fleetCount === "Brak danych" || defenseExistence === "Brak danych") {
        console.log(`${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Brak dostatecznych informacji. Wysyłam więcej sond: ${amountOfSpyProbe + 15000}`);

        await sendFleet(fleetStatistics.link_SPY_PROBE, amountOfSpyProbe, String(cleanCoordinates[0]), String(cleanCoordinates[1]), String(cleanCoordinates[2]), stringSpy);
        amountOfSpyProbe += 15000;
      } else if (fleetCount !== 0 || defenseExistence !== 0) {
        // Zapisuję do pliku farmCoordinates.json flagę, że planeta posiada obronę i/lub flotę aby nie wysyłać do niej sond szpiegowskich.
        await modifyJsonFile("../data/farmCoordinates.json", indexActualArray, stringDanger);

        console.log(
          `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Na planecie znajduje się - Flota: ${fleetCount}, Obrona: ${defenseExistence}. Nie wysyłam statków.`
        );

        isThereDangerOnThePlanet = true;
      } else {
        isDone = false;
        console.log(`${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Brak obrony oraz floty.`);
      }

      if (isThereDangerOnThePlanet === false) {
        const checkSpyReport_Metal: ElementHandle<HTMLImageElement> = await page.$(".message-content tr:nth-of-type(2) td img");
        await delay(500);
        const checkSpyReport_Crystal: ElementHandle<HTMLImageElement> = await page.$(".message-content tr:nth-of-type(3) td img");
        await delay(500);
        const checkSpyReport_Deuterium: ElementHandle<HTMLImageElement> = await page.$(".message-content tr:nth-of-type(4) td img");
        await delay(500);
        if (checkSpyReport_Metal && checkSpyReport_Crystal && checkSpyReport_Deuterium) {
          const metal = await takeNextSiblingText(checkSpyReport_Metal, page);
          const crystal = await takeNextSiblingText(checkSpyReport_Crystal, page);
          const deuterium = await takeNextSiblingText(checkSpyReport_Deuterium, page);

          let sumOfAllResources = metal + crystal + deuterium;
          let numberOfAttacks = 6;

          if (sumOfAllResources < 500000000000) {
            console.log(`${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Za mało surowców aby się fatygować: ${sumOfAllResources.toLocaleString("pl-PL")}`);
            // TODO sprawdzić czy to nie jest nierozbudowana planeta (sprawdzić lvl storage's)
            return;
          } else if (sumOfAllResources > 2000000000000) {
            numberOfAttacks = 6;
          } else if (sumOfAllResources >= 500000000000 || sumOfAllResources <= 2000000000000) {
            numberOfAttacks = 3;
          } else {
            numberOfAttacks = 1;
          }

          console.log(
            `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Na planecie jest surowców:
            ${sumOfAllResources.toLocaleString("pl-PL")}. Wysyłam na nią ${numberOfAttacks} ( fal ) statków.`
          );

          for (let i = 0; i < numberOfAttacks; i++) {
            let getPercentageOfResourcesForOneFly = sumOfAllResources * 0.4;
            let amountOfShipsToSend = integerConversionAndRoundingUp(getPercentageOfResourcesForOneFly, fleetStatistics.cargoCapacity_HEAVY_CARGO);
            console.log(
              `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Wysyłam w fali: ${i + 1}/${numberOfAttacks} - ${amountOfShipsToSend.toLocaleString(
                "pl-PL"
              )} Heavy Cargo.`
            );

            await sendFleet(fleetStatistics.link_HEAVY_CARGO, amountOfShipsToSend, String(cleanCoordinates[0]), String(cleanCoordinates[1]), String(cleanCoordinates[2]), stringAttack);

            sumOfAllResources = sumOfAllResources - getPercentageOfResourcesForOneFly;
          }

          // Zapisuję do pliku farmCoordinates.json datę zabrania surowców z planety
          await modifyJsonFile("../data/farmCoordinates.json", indexActualArray, stringSafe);
        }

        return;
      }
      return;
    }
  } catch (error) {
    console.error("Błąd w checkSpyMessages.js: ", error);
    return;
  }
}

async function takeNextSiblingText(element: ElementHandle, page) {
  const resource: string | null = await page.evaluate((img) => {
    const textNode = img.nextSibling;
    return textNode ? textNode.textContent.trim() : null;
  }, element);

  const cleanText = resource.replace(/[,.:]/g, "");
  return Number(cleanText);
}

function extractCoordinateNumbers(text: string) {
  // Wyrażenie regularne do znalezienia liczb w formacie [1:469:12]
  const regex = /\[(\d+):(\d+):(\d+)\]/;

  // Dopasowanie wyrażenia regularnego do tekstu
  const match: RegExpMatchArray | null = text.match(regex);

  if (match) {
    // Wyciąganie liczb z dopasowania
    const numbers = match.slice(1).map(Number);

    return numbers;
  } else {
    console.log("No match found");
    return [];
  }
}

function extractNumberFromString(str: string) {
  if (str === null || str === undefined) {
    return "Brak danych";
  }

  // Usuwanie wszystkiego oprócz cyfr
  const cleanedString = str.replace(/[^0-9]/g, "");

  // Sprawdzanie, czy cleanedString jest prawidłową liczbą
  if (cleanedString.length > 0 && !isNaN(Number(cleanedString))) {
    return Number(cleanedString);
  } else {
    throw new Error("Ciąg wejściowy nie jest w oczekiwanym formacie");
  }
}

// Konwertuje na liczbę całkowitą i zaokrąglam ją w górę
function integerConversionAndRoundingUp(amountOfResources: number, cargoCapacity: number) {
  const amountOfShips = Math.ceil(amountOfResources / cargoCapacity);

  return amountOfShips;
}
