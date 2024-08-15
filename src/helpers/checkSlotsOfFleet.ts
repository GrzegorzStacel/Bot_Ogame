import { ElementHandle, Page, HTTPResponse } from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { takeInnerText } from "./takeInnerText.js";
import { delay } from "../utils/delay.js";

export async function checkSlotsOfFleet() {
  const { page } = await setupBrowser();
  let fleetPage: ElementHandle<HTMLAnchorElement> | null;

  try {
    await page.waitForSelector(".fleet-info-section div");
    const isNoFleetMovement: string = await takeInnerText(".fleet-info-section div");

    if (isNoFleetMovement === "No fleet movement") {
      return;
    }

    await page.waitForSelector(".fleet-info-box span");
    const takeTextWithAmountOfSlots: string = await takeInnerText(".fleet-info-box span");
    const slotsBusyAndMax: [number, number] = extractNumbersFromString(takeTextWithAmountOfSlots);

    const busySlots = slotsBusyAndMax[0];
    const maxSlots = slotsBusyAndMax[1];

    if (busySlots === maxSlots) {
      await page.waitForSelector(".fleet-info-section");

      const remainingSeconds = await getRemainingSeconds(page);
      console.log(`Czekam na powrót floty ${remainingSeconds} sekund.`);

      await delay(remainingSeconds);
    } else {
      console.log("Jest wolny slot. Można wysłać flotę.");
      return;
    }
  } catch (error) {
    console.error("Błąd w checkSlotsOfFleet.js: ", error);
  }
}

async function getRemainingSeconds(page: Page): Promise<number> {
  await page.waitForSelector("#fleet-movement-detail-btn div:nth-of-type(2) span");
  const textWithEarliestFleetReturnTimeSpan: string = await takeInnerText("#fleet-movement-detail-btn div:nth-of-type(2) span");
  const minutesAndSecondsToFleetReturn: [number, number] = extractNumbersFromString(textWithEarliestFleetReturnTimeSpan);

  // Tablica [0] przechowuje minuty, a [1] sekundy, 5000 to jest ekstra czas na ewentualnie doładowanie się elementów DOM'u
  const milisecondsToFleetReturn: number = minutesAndSecondsToFleetReturn[0] * 60 + minutesAndSecondsToFleetReturn[1] * 1000 + 5000;

  return milisecondsToFleetReturn;
}

function extractNumbersFromString(str) {
  // Użycie wyrażenia regularnego do wyodrębnienia liczb
  const numbers = str.match(/\d+/g);

  // Zwraca tablicę z dwiema liczbami
  return numbers ? numbers.map(Number) : [];
}
