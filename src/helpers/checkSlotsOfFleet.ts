import puppeteer from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { takeInnerText } from "./takeInnerText.js";
import { delay } from "../utils/delay.js";

export async function checkSlotsOfFleet(needFreeNumberOfSlots) {
  console.log("checkSlotsOfFleet.js - needFreeNumberOfSlots::: ", needFreeNumberOfSlots);
  const { page } = await setupBrowser();

  try {
    const isNoFleetMovement = await takeInnerText(".fleet-info-section div");
    await delay();

    if (isNoFleetMovement === "No fleet movement") {
      return;
    }
    console.log("1");

    const maxSlotsOfFleet_string = await takeInnerText("#fleet-movement-detail-btn span b");
    const maxSlotsOfFleet = Number(maxSlotsOfFleet_string);
    await delay();
    console.log("2");

    const busySlotsOfFleet_string = await takeInnerText("#fleet-movement-detail-btn span:last-of-type");
    await delay();

    console.log("3");
    // \d+ to wyrażenie regularne, które dopasowuje jedną lub więcej cyfr.
    // busySlotsOfFleet.match(/\d+/) zwraca tablicę wszystkich dopasowań wyrażenia regularnego w ciągu znaków busySlotsOfFleet. Zwróci np. tablicę ["17"].
    // [0] wybiera pierwszy (i jedyny) element tej tablicy, czyli "17".
    const busySlotsOfFleet = Number(busySlotsOfFleet_string.match(/\d+/)[0]);
    console.log("busySlotsOfFleet::: ", busySlotsOfFleet);
    console.log("maxSlotsOfFleet::: ", maxSlotsOfFleet);
    console.log("busySlotsOfFleet === maxSlotsOfFleet ", busySlotsOfFleet === maxSlotsOfFleet);
    //3
    // busySlotsOfFleet:::  20
    // maxSlotsOfFleet:::  20
    // busySlotsOfFleet === maxSlotsOfFleet  true
    console.log("4");
    if (busySlotsOfFleet === maxSlotsOfFleet) {
      //TODO czekaj aż flota wróci w ilości pokrywającej wartości zmiennej needFreeNumberOfSlots 1/3/6
      const openModuleToCheckTheTimeToRemainingFlote = await page.$(".fleet-info-section");
      openModuleToCheckTheTimeToRemainingFlote.click();

      const remainingSeconds = await getRemainingSeconds(page, needFreeNumberOfSlots);
      console.log(`checkSlotsOfFleet.js - czekam na powrót ${needFreeNumberOfSlots} (flot) ${remainingSeconds} sekund.`);

      await delay(remainingSeconds);
    } else if (busySlotsOfFleet + needFreeNumberOfSlots <= maxSlotsOfFleet) {
      console.log("5");
      return;
    }
    await delay();

    await delay();
  } catch (error) {
    console.error("Błąd w checkSlotsOfFleet.js: ", error);
  }
}

async function getRemainingSeconds(page, needFreeNumberOfSlots) {
  // Ustal poprawny indeks, zakładając, że `needFreeNumberOfSlots` to liczba
  const index = needFreeNumberOfSlots - 1; // Przypisanie do nowej zmiennej

  const remainingSeconds = await page.evaluate((index) => {
    // Znajdź odpowiedni <tr> w tabeli o id "fleet-movement-table"
    const row = document.querySelectorAll("#fleet-movement-table tr")[index];

    if (row) {
      // Znajdź <td> z atrybutem data-remaining-seconds
      const td = row.querySelector("td[data-remaining-seconds]");
      return td ? td.textContent.trim() : null;
    }
    return null;
  }, index); // Przekazanie zmiennej index do evaluate

  return remainingSeconds; // Zwracanie wyniku
}
