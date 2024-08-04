async function writeDataToFile(filePath, arraywithData) {
  try {
    const existingData = await fs.readFile(filePath, "utf8").catch(() => "[]");
    const existingArray = JSON.parse(existingData);

    // Połącz istniejące dane z nowymi
    console.log("arrayWithCoordinatesToInactivePlanets::: ", arrayWithCoordinatesToInactivePlanets);
    let updatedArray = existingArray.concat(arraywithData);

    // Dodaję 2x undefined, które odpowiadają za pozycję daty oraz flagi safe/danger. Te dane zostaną zaktualizowane o poprawne wartości w innej funkcji.
    updatedArray.push(undefined, undefined);

    // Zapisz zaktualizowaną tablicę do pliku
    await fs.writeFile(filePath, JSON.stringify(updatedArray, null, 2));

    console.log(`Dane zostały zapisane do pliku: ${updatedArray}`);
  } catch (error) {
    console.error("Wystąpił błąd podczas zapisu danych w writeDataToFile.js:", error);
  }
}

module.exports = { writeDataToFile };
