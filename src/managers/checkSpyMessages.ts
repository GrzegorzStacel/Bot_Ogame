import puppeteer, { ElementHandle, HTTPResponse } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import fs from "fs/promises";
import { importantStrings } from "../data/settings.js";
import { takeInnerText } from "../helpers/takeInnerText.js";
import { delay } from "../utils/delay.js";
import { fleetStatistics } from "../data/fleetStatistics.js";
import { sendFleet } from "./sendFleet.js";
import { checkSlotsOfFleet } from "../helpers/checkSlotsOfFleet.js";
import { modifyJsonFile } from "../helpers/modifyJsonFile.js";

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
        // await checkSlotsOfFleet(1);

        const messagesPage: ElementHandle<HTMLAnchorElement> | null = await page.$("a[href='/messages']");
        const navigationPromise: Promise<HTTPResponse> = page.waitForNavigation();

        await messagesPage.click();

        await navigationPromise;
        await delay(3000);
      } else {
        console.log("Nie weszliśmy do strony z wiadomościami!");
        return;
      }

      const takeCoordinates = await takeInnerText(".message-head .head-left span a");
      await delay(500);
      cleanCoordinates = extractCoordinateNumbers(takeCoordinates);

      const fleetExistenceString = await takeInnerText(".message-content tr:nth-of-type(2) td:last-child span");
      const fleetCount = extractNumberFromString(fleetExistenceString);
      await delay(500);

      const defenseExistenceString = await takeInnerText(".message-content tr:nth-of-type(3) td:last-child span");
      const defenseExistence = extractNumberFromString(defenseExistenceString);
      await delay(500);

      // TODO nie jestem w stanie tego przetestować, ponieważ nie znalazłem planety z flotą lub obroną ( jest na planecie [1:471:13])
      if (fleetCount === "Brak danych" || defenseExistence === "Brak danych") {
        console.log(
          `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Brak dostatecznych informacji. Wysyłam więcej sond: ${
            amountOfSpyProbe + 15000
          }`
        );
        await sendFleet(
          fleetStatistics.link_SPY_PROBE,
          amountOfSpyProbe,
          String(cleanCoordinates[0]),
          String(cleanCoordinates[1]),
          String(cleanCoordinates[2]),
          stringSpy
        );
        delay(5000);
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
            console.log(
              `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${
                cleanCoordinates[2]
              } - Za mało surowców aby się fatygować: ${sumOfAllResources.toLocaleString("pl-PL")}`
            );
            // TODO sprawdzić czy to nie jest nierozbudowana planeta (sprawdzić lvl storage's)
            return;
          } else if (sumOfAllResources > 2000000000000) {
            numberOfAttacks = 6;
          } else if (sumOfAllResources >= 500000000000 || sumOfAllResources <= 2000000000000) {
            numberOfAttacks = 3;
          } else {
            numberOfAttacks = 1;
          }

          // TODO func checkSlotsOfFleet odpala się od razu po info o wysłaniu 6k sond (może przelatuje tutaj góre ale nic nie robi). numberofattack jest undefined, dlatego wywala błąd w poniższej func.
          console.log("checkSpyMessages.js - numberOfAttacks::: ", numberOfAttacks);
          await checkSlotsOfFleet(numberOfAttacks);

          console.log(
            `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Na planecie jest surowców:
            ${sumOfAllResources.toLocaleString("pl-PL")}. Wysyłam na nią ${numberOfAttacks} ( fal ) statków.`
          );

          for (let i = 0; i < numberOfAttacks; i++) {
            let amountOfShipsToSend = integerConversionAndRoundingUp(getPercentageOfResourcesForOneFly, fleetStatistics.cargoCapacity_HEAVY_CARGO);
            console.log(
              `${cleanCoordinates[0]}:${cleanCoordinates[1]}:${cleanCoordinates[2]} - Wysyłam w fali: ${i + 1} - ${amountOfShipsToSend.toLocaleString(
                "pl-PL"
              )} Heavy Cargo.`
            );

            await sendFleet(
              fleetStatistics.link_HEAVY_CARGO,
              amountOfShipsToSend,
              String(cleanCoordinates[0]),
              String(cleanCoordinates[1]),
              String(cleanCoordinates[2]),
              stringAttack
            );

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
