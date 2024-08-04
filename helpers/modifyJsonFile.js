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

    // Dodaj nową wartość do drugiej tablicy
    if (jsonArray.length > indexActualArray) {
      jsonArray[indexActualArray].push(getFormattedActualDate());
      jsonArray[indexActualArray].push(isSafe);
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
