import { ElementHandle, Page, HTTPResponse } from "puppeteer";
import { delay } from "../utils/delay.js";
import { takeInnerText } from "../helpers/domHelpers/takeInnerText.js";
import { timeStringToMilliseconds } from "../helpers/dateHelpers/timeStringToMilliseconds.js";
import { checkSlotsOfFleet } from "../helpers/fleetHelpers/checkSlotsOfFleet.js";
import { getRandomNumber } from "../helpers/randomHelpers/getRandomNumber.js";
import { navigationUtils } from "../utils/navigationUtils.js";
import { navigationPaths } from "../config/settings.js";

export async function sendFleet(shipElement: string, amountOfShips: number, numberOfgalaxy: string, numberOfSystem: string, numberOfPlanet: string, mission: string, page: Page) {
  try {
    await navigationUtils(navigationPaths.fleetPath);
    await checkSlotsOfFleet(page);

    // Sprawdzam czy są dostępne statki, jeśli nie, wychodzę z funkcji
    await page.waitForSelector(shipElement);
    const selectShip: ElementHandle<Element> = await page.$(shipElement);
    await delay(getRandomNumber(450, 2000));

    if (!selectShip) {
      // TODO gdy brak statków, wybudować nowe
      console.log("Brak dostępnych statków!");
      return;
    } else {
      // Podaj ilość statków do wysłania
      const nextElementHandle: ElementHandle | null = await page.evaluateHandle((el) => el.nextElementSibling, selectShip);

      if (nextElementHandle) {
        // Sprawdź, czy następny element rodzeństwa zawiera <input>
        const inputHandle: ElementHandle<HTMLInputElement> | null = await page.evaluateHandle((el) => el.querySelector("input"), nextElementHandle);

        // Wprowadź ilość statków do wysłania
        // amountOfShips + 1000 wysyłam ekstra ilość statków aby przetestować czy statki zabiorą więcej niż 40% całkowitych zasobów
        if (inputHandle) {
          setValueInInput(inputHandle, String(amountOfShips + 1000), page);
          await delay(getRandomNumber(1000, 3000));
        }
      }

      await page.waitForSelector(".btn-continue");
      let clickNextButton: ElementHandle<Element> = await page.$(".btn-continue");
      await clickNextButton.click();
      await delay(getRandomNumber(450, 2000));

      const changeCoordinatesGalaxy: ElementHandle<Element> = await page.$("#fleet2_target_coords_container :nth-child(1)");
      const changeCoordinatesSpace: ElementHandle<Element> = await page.$("#fleet2_target_coords_container :nth-child(2)");
      const changeCoordinatesPlanet: ElementHandle<Element> = await page.$("#fleet2_target_coords_container :nth-child(3)");
      delay(getRandomNumber(450, 2000));

      await changeCoordinatesGalaxy.click();
      await setValueInInput(changeCoordinatesGalaxy, numberOfgalaxy, page);
      await delay(getRandomNumber(450, 2000));

      await changeCoordinatesSpace.click();
      await setValueInInput(changeCoordinatesSpace, numberOfSystem, page);
      await delay(getRandomNumber(450, 2000));

      await changeCoordinatesPlanet.click();
      await setValueInInput(changeCoordinatesPlanet, numberOfPlanet, page);
      await delay(getRandomNumber(1000, 3000));

      await page.waitForSelector(".fleet-target-brief .btn-continue");
      clickNextButton = await page.$(".fleet-target-brief .btn-continue");
      await clickNextButton.click();
      await delay(getRandomNumber(350, 1000));

      // Pobieram czas jaki potrzebuje sonda szpiegowska aby dolecieć do danej planety i zwracam ten czas w milisekundach w return
      await page.waitForSelector("#fleet3_briefing li:nth-child(3)");
      const flightDurationOneWay_string = await takeInnerText("#fleet3_briefing li:nth-child(3)");
      const flightDurationOneWay = timeStringToMilliseconds(flightDurationOneWay_string);
      await delay(getRandomNumber(350, 1000));

      await page.waitForSelector(`a[data-mission-name="${mission}"]`);
      const selectAttackBtn: ElementHandle<HTMLAnchorElement> = await page.$(`a[data-mission-name="${mission}"]`);
      await selectAttackBtn.click();
      await delay(getRandomNumber(350, 1000));

      await page.waitForSelector(".mission-select-bottom .btn-continue");
      clickNextButton = await page.$(".mission-select-bottom .btn-continue");
      await clickNextButton.click();
      await delay(getRandomNumber(350, 1000));

      console.log(`${numberOfgalaxy}:${numberOfSystem}:${numberOfPlanet} - Statki zostały wysłane.`);

      return flightDurationOneWay;
    }
  } catch (error) {
    console.error(`Wystąpił błąd: ${error.message}`);
    console.error(`Szczegóły błędu: ${error.stack}`);
    return;
  }
}

async function setValueInInput(element: ElementHandle<Element>, value: string, page: Page) {
  await page.evaluate(
    (input: HTMLInputElement, setValue: string) => {
      input.value = setValue;
      // Wysyła zdarzenie input, aby zaktualizować interfejs
      input.dispatchEvent(new Event("input", { bubbles: true }));
    },
    element,
    value
  );
}
