const fs = require("fs").promises;

async function writeDataToFile(filePath, arraywithData) {
  try {
    const existingData = await fs.readFile(filePath, "utf8").catch(() => "[]");
    const existingArray = JSON.parse(existingData);

    // Połącz istniejące dane z nowymi
    let updatedArray = existingArray.concat(arraywithData);

    // Dodaję 2x null, które odpowiadają za pozycję daty oraz flagi safe/danger. Te dane zostaną zaktualizowane o poprawne wartości w innej funkcji.
    updatedArray = updatedArray.map((subArray) => {
      if (Array.isArray(subArray)) {
        while (subArray.length < 5) {
          subArray.push(null);
        }
      }
      return subArray;
    });

    // Zapisz zaktualizowaną tablicę do pliku
    await fs.writeFile(filePath, JSON.stringify(updatedArray, null, 2));

    console.log(`Dane zostały zapisane do pliku: ${updatedArray}`);
  } catch (error) {
    console.error("Wystąpił błąd podczas zapisu danych w writeDataToFile.js:", error);
  }
}

module.exports = { writeDataToFile };
