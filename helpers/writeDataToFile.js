const fs = require("fs").promises;

async function writeDataToFile(filePath, arraywithData) {
  try {
    const existingData = await fs.readFile(filePath, "utf8").catch(() => "[]");
    const existingArray = JSON.parse(existingData);

    // Utwórz mapę do szybkiego dostępu do istniejących danych
    const existingMap = new Map(existingArray.map((item) => [item.slice(0, 3).join(","), item]));

    // Utwórz mapę do szybkiego dostępu do nowych danych
    const newArrayMap = new Map(arraywithData.map((item) => [item.slice(0, 3).join(","), item]));

    // Utwórz nową tablicę z aktualizowanych danych
    const updatedArray = [];

    // Dodaj nowe dane lub zaktualizuj istniejące
    for (const [key, newItem] of newArrayMap) {
      if (existingMap.has(key)) {
        // Zaktualizuj istniejące dane, jeśli nowe dane są dostępne
        const existingItem = existingMap.get(key);
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

    const finalArray = updatedArray.map((subArray) => {
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

module.exports = { writeDataToFile };
