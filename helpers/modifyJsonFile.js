const fs = require("fs");
const path = require("path");
const { getFormattedActualDate } = require("./getFormattedActualDate");

async function modifyJsonFile(filePathArg, indexActualArray, isSafe) {
  try {
    // Ścieżka do pliku JSON
    const filePath = path.join(__dirname, filePathArg);

    // Wczytaj zawartość pliku JSON
    const data = await fs.promises.readFile(filePath, "utf8");
    const jsonArray = JSON.parse(data);

    console.log(`Rozpoczynam modyfikowanie pliku JSON: ${jsonArray[indexActualArray]}`);

    // Sprawdź, czy tablica o podanym indeksie istnieje
    if (jsonArray.length > indexActualArray) {
      // Zaktualizuj wybraną tablicę
      const targetArray = jsonArray[indexActualArray];

      // Jeśli brak daty i flagi w tablicy, dodaj je
      if (targetArray.length < 4 || targetArray[3] === null) {
        targetArray[3] = getFormattedActualDate();
      }
      if (targetArray.length < 5 || targetArray[4] === null) {
        targetArray[4] = isSafe;
      }

      // Zaktualizuj odpowiedni element w jsonArray
      jsonArray[indexActualArray] = targetArray;
    } else {
      console.log(`Tablica nr ${indexActualArray} nie istnieje.`);
      return;
    }

    // Zapisz zmodyfikowany plik JSON
    await fs.promises.writeFile(filePath, JSON.stringify(jsonArray, null, 2), "utf8");

    console.log(`Plik JSON został zaktualizowany: ${jsonArray[indexActualArray]}`);
  } catch (error) {
    console.error("Wystąpił błąd podczas modyfikowania pliku JSON w modifyJsonFile.js:", error);
  }
}

module.exports = { modifyJsonFile };
