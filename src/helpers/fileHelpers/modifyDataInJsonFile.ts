import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { getCurrentDate } from "../dateHelpers/getCurrentDate.js";

type JsonArray = [string, string, string, string | null, string | null];

export async function modifyDataInJsonFile(filePathArg: string, indexActualArray: number, isSafe: string) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Ścieżka do pliku JSON
    const filePath = path.join(__dirname, filePathArg);

    // Wczytaj zawartość pliku JSON
    const data = await fs.promises.readFile(filePath, "utf8");
    const jsonArray: JsonArray[] = JSON.parse(data);

    console.log(`Rozpoczynam modyfikowanie pliku JSON: ${jsonArray[indexActualArray]}`);

    // Sprawdź, czy tablica o podanym indeksie istnieje
    if (jsonArray.length > indexActualArray) {
      // Zaktualizuj wybraną tablicę
      const targetArray = jsonArray[indexActualArray];
      const actualDate = getCurrentDate();

      // Jeśli brak daty i flagi w tablicy, dodaj je
      if (targetArray.length < 4 || targetArray[3] === null || targetArray[3] !== actualDate) {
        targetArray[3] = actualDate;
      }
      if (targetArray.length < 5 || targetArray[4] === null || targetArray[4] !== isSafe) {
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
