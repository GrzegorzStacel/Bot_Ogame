import { Page } from "puppeteer";
import { takeInnerText } from "../domHelpers/takeInnerText.js";
import { delay } from "../../utils/delay.js";

export async function checkSlotsOfFleet(page: Page): Promise<void> {
  try {
    await page.waitForSelector(".fleet-info-section div");
    const isNoFleetMovement: string = await takeInnerText(".fleet-info-section div");

    if (isNoFleetMovement === "No fleet movement") {
      return;
    }

    await page.waitForSelector(".fleet-info-box span");
    const takeTextWithAmountOfSlots: string = await takeInnerText(".fleet-info-box span");
    const [busySlots, maxSlots] = extractNumbersFromString(takeTextWithAmountOfSlots);

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
    console.error(`Wystąpił błąd: ${error.message}`);
    console.error(`Szczegóły błędu: ${error.stack}`);
  }
}

async function getRemainingSeconds(page: Page): Promise<number> {
  await page.waitForSelector("#fleet-movement-detail-btn div:nth-of-type(2) span");
  const textWithEarliestFleetReturnTimeSpan: string = await takeInnerText("#fleet-movement-detail-btn div:nth-of-type(2) span");
  const [minutesToFleetReturn, secondsToFleetReturn]: [number, number] = extractNumbersFromString(textWithEarliestFleetReturnTimeSpan);

  // Tablica [0] przechowuje minuty, a [1] sekundy, 10000 to jest ekstra czas na ewentualnie doładowanie się elementów DOM'u
  const milisecondsToFleetReturn: number = minutesToFleetReturn * 60 * 1000 + secondsToFleetReturn * 1000 + 10000;

  return milisecondsToFleetReturn;
}

function extractNumbersFromString(str: string): [number, number] {
  // Użycie wyrażenia regularnego do wyodrębnienia liczb
  const numbers = str.match(/\d+/g)?.map(Number);

  if (numbers && numbers.length >= 2) {
    return [numbers[0], numbers[1]];
  }

  throw new Error("Błąd w pliku checkSlotsOfFleet w funkcji extractNumbersFromString(). Ciąg nie zawiera wystarczającej liczby liczb.");
}
