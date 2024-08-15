import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

type DataItem = [string, string, string, string?, string?];

export async function writeDataToJsonFile(filePathArg: string, arraywithData: Array<[string, string, string]>) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Ścieżka do pliku JSON
    const filePath = path.join(__dirname, filePathArg);

    const existingData: string = await fs.readFile(filePath, "utf8").catch(() => "[]");
    const existingArray: DataItem[] = JSON.parse(existingData);

    // Utwórz mapę do szybkiego dostępu do istniejących danych
    const existingMap = new Map<string, DataItem>(existingArray.map((item) => [item.slice(0, 3).join(","), item]));

    // Utwórz mapę do szybkiego dostępu do nowych danych
    const newArrayMap = new Map<string, DataItem>(arraywithData.map((item) => [item.slice(0, 3).join(","), item]));

    // Utwórz nową tablicę z aktualizowanych danych
    const updatedArray: DataItem[] = [];

    // Dodaj nowe dane lub zaktualizuj istniejące
    for (const [key, newItem] of newArrayMap) {
      // key: string
      // newItem: DataItem[]

      if (existingMap.has(key)) {
        // Zaktualizuj istniejące dane, jeśli nowe dane są dostępne
        const existingItem: DataItem | null = existingMap.get(key);

        if (newItem.length > 3) {
          existingItem[3] = newItem[3] || existingItem[3];
        }
        if (newItem.length > 4) {
          existingItem[4] = newItem[4] || existingItem[4];
        }

        updatedArray.push(existingItem);

        existingMap.delete(key); // Usuń z mapy istniejących danych, bo już zostało zaktualizowane
      } else {
        // Dodaj nowe dane, które nie istnieją w istniejących danych
        updatedArray.push([...newItem]);
      }
    }

    const finalArray: DataItem[] = updatedArray.map((subArray) => {
      if (Array.isArray(subArray)) {
        while (subArray.length < 5) {
          subArray.push(null);
        }
      }
      return subArray;
    });

    // Zapisz zaktualizowaną tablicę do pliku
    await fs.writeFile(filePath, JSON.stringify(finalArray, null, 2));

    console.log(`Dane zostały zapisane do pliku: ${finalArray}`);
  } catch (error) {
    console.error("Wystąpił błąd podczas zapisu danych w writeDataToFile.js:", error);
  }
}
