import { Page } from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { importantStrings } from "../config/settings.js";
import { sendFleet } from "./sendFleet.js";
import { fleetStatistics } from "../data/fleetStatistics.js";
import { checkSpyMessages } from "./checkSpyMessages.js";
import { delay } from "../utils/delay.js";
import { getCurrentDate } from "../helpers/dateHelpers/getCurrentDate.js";

type CoordinatesArray = [string, string, string, string | null, string | null];

export async function farmManager(page: Page) {
  const { link_SPY_PROBE } = fleetStatistics;
  const actualDate = getCurrentDate();
  const { stringSafe, stringDanger, stringSpy } = importantStrings;

  // Uzyskanie ścieżki do katalogu roboczego
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Ścieżka do pliku
  const filePath = path.join(__dirname, "../data/farmCoordinates.json");

  try {
    // Wczytaj dane z pliku JSON
    const data = await fs.readFile(filePath, "utf8");
    const coordinatesArray: CoordinatesArray = JSON.parse(data);

    // Iteruj przez każdą wewnętrzną tablicę i przekaż ją do funkcji
    for (const [index, coordinates] of coordinatesArray.entries()) {
      const [galaxy, system, planet, date, isSafe] = coordinates;

      if (date !== actualDate || date === null) {
        if (isSafe === null || isSafe === stringSafe) {
          console.log(`${galaxy}:${system}:${planet} - Przygotowuję do wysłania 6000 sond szpiegowskich`);

          const numberOfProbes: number = 5000;
          let flightDurationOneWay = await sendFleet(link_SPY_PROBE, numberOfProbes, galaxy, system, planet, stringSpy, page);

          await delay((flightDurationOneWay += 2000));
          await checkSpyMessages(index);
        }
      }

      // TODO zaznaczyć planety z bardzo małą produkcją aby nie wysyłać do nich sond szpiegowskich

      if (isSafe === stringDanger) {
        console.log(`${galaxy}:${system}:${planet} - Nie wysyłam sond. Planeta posiada obronę i/lub stacjonuje na niej flota.`);
      } else if (isSafe === stringSafe) {
        console.log(`${galaxy}:${system}:${planet} - Nie wysyłam sond. Dziś już odiwedziliśmy planetę.`);
      } else {
        console.log(`${galaxy}:${system}:${planet} - Nie wysyłam sond. Planeta najprawdopodobniej posiada obronę i/lub stacjonuje na niej flota.`);
      }

      // TODO sprawdzić czy są wolne sloty jeśli nie pobrać ilość czasu do powrotu statków
    }
  } catch (error) {
    console.error(`Wystąpił błąd w farmManager.js: ${error.message}`);
    console.error(`Szczegóły błędu w farmManager.js: ${error.stack}`);
  }
}
