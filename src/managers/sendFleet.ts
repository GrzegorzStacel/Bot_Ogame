import puppeteer from "puppeteer";
import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { delay } from "../../utils/delay.js";
import { takeInnerText } from "../helpers/takeInnerText.js";
import { getStringAndConvertTimeToMilliseconds } from "../helpers/getStringAndConvertTimeToMilliseconds.js";

// mission = "Attack", "Spy"
export async function sendFleet(shipElement, amount, numberOfgalaxy, numberOfSystem, numberOfPlanet, mission) {
  try {
    const { page } = await setupBrowser();

    if (page) {
      const fleetPage = await page.$("a[href='/fleet']");
      const navigationPromise = page.waitForNavigation();

      await fleetPage.click();

      await navigationPromise;

      await delay(3000);
    } else {
      console.log("Nie znaleziono przycisku z flotą!", fleetPage);
      return;
    }

    // Sprawdzam czy są dostępne statki, jeśli nie, wychodzę z funkcji
    const selectShip = await page.$(shipElement);

    if (!selectShip) {
      // TODO gdy brak statków, wybudować nowe
      console.log("Brak dostępnych statków!");
      return;
    } else {
      // Podaj ilość statków do wysłania
      const nextElementHandle = await page.evaluateHandle((el) => el.nextElementSibling, selectShip);

      if (nextElementHandle) {
        // Sprawdź, czy następny element rodzeństwa zawiera <input>
        const inputHandle = await page.evaluateHandle((el) => el.querySelector("input"), nextElementHandle);

        // Wprowadź ilość statków do wysłania
        // amount + 1000 wysyłam ekstra ilość statków aby przetestować czy statki zabiorą więcej niż 40% całkowitych zasobów
        if (inputHandle) {
          setValueInInput(inputHandle, amount + 1000, page);
          await delay();
        }
      }
      let clickNextButton = await page.$(".btn-continue");
      await clickNextButton.click();
      await delay();

      const changeCoordinatesGalaxy = await page.$("#fleet2_target_coords_container :nth-child(1)");
      const changeCoordinatesSpace = await page.$("#fleet2_target_coords_container :nth-child(2)");
      const changeCoordinatesPlanet = await page.$("#fleet2_target_coords_container :nth-child(3)");
      delay(500);

      await changeCoordinatesGalaxy.click();
      await setValueInInput(changeCoordinatesGalaxy, numberOfgalaxy, page);

      await changeCoordinatesSpace.click();
      await setValueInInput(changeCoordinatesSpace, numberOfSystem, page);

      await changeCoordinatesPlanet.click();
      await setValueInInput(changeCoordinatesPlanet, numberOfPlanet, page);
      await delay();

      clickNextButton = await page.$(".fleet-target-brief .btn-continue");
      await clickNextButton.click(1000);
      await delay();

      // Pobieram czas jaki potrzebuje sonda szpiegowska aby dolecieć do danej planety i zwracam ten czas w milisekundach w return
      const flightDurationOneWay_string = await takeInnerText("#fleet3_briefing li:nth-child(3)");
      const flightDurationOneWay = await getStringAndConvertTimeToMilliseconds(flightDurationOneWay_string);

      const selectAttackBtn = await page.$(`a[data-mission-name="${mission}"]`);
      await selectAttackBtn.click(1000);
      await delay();

      clickNextButton = await page.$(".mission-select-bottom .btn-continue");
      await clickNextButton.click(1000);
      await delay();

      console.log(`${numberOfgalaxy}:${numberOfSystem}:${numberOfPlanet} - Statki zostały wysłane.`);

      return flightDurationOneWay;
    }
  } catch (error) {
    console.error("Błąd w sendFleet.js: ", error);
    return;
  }
}

async function setValueInInput(element, value, page) {
  await page.evaluate(
    (input, setValue) => {
      input.value = setValue;
      // Wysyła zdarzenie input, aby zaktualizować interfejs
      input.dispatchEvent(new Event("input", { bubbles: true }));
    },
    element,
    value
  );
}
