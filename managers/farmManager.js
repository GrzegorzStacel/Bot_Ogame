const puppeteer = require("puppeteer");
// const { setupBrowser } = require("../setupBrowser/setupBrowser");
const fs = require("fs").promises;
const path = require("path");
const { importantStrings } = require("../settings");
const { sendFleet } = require("./sendFleet");
const { fleetStatistics } = require("../data/fleetStatistics");
const { farmCoordinates } = require("../data/farmCoordinates");
const { checkSpyMessages } = require("./checkSpyMessages");
const { delay } = require("../utils/delay");
const { getFormattedActualDate } = require("../helpers/getFormattedActualDate");

async function farmManager() {
  // const { page } = await setupBrowser();
  const { link_SPY_PROBE } = fleetStatistics;
  const actualDate = getFormattedActualDate();
  const { stringSafe, stringDanger, stringSpy } = importantStrings;

  // Ścieżka do pliku
  const filePath = path.join(__dirname, "../data/farmCoordinates.json");

  try {
    // Wczytaj dane z pliku JSON
    const data = await fs.readFile(filePath, "utf8");
    const coordinatesArray = JSON.parse(data);

    // Iteruj przez każdą wewnętrzną tablicę i przekaż ją do funkcji
    for (const [index, coordinates] of coordinatesArray.entries()) {
      const [galaxy, system, planet, date, isSafe] = coordinates;

      if (date !== actualDate || date === null) {
        if (isSafe === null || isSafe === stringSafe) {
          // console.log("Ilość przeskanowanych planet: ", index);
          console.log(`${galaxy}:${system}:${planet} - Wysyłam 6000 sond szpiegowskich`);

          let flightDurationOneWay = await sendFleet(link_SPY_PROBE, 5000, galaxy, system, planet, stringSpy);
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
    console.error("Błąd w farmManager.js: ", error);
  }
}

module.exports = { farmManager };
