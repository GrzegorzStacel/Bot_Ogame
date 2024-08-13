// Zwraca zmięnną typu string w formacie np. 21-03-2024
export function getFormattedActualDate() {
  const currentDate = new Date();

  // Pobranie dnia, miesiąca i roku
  const day = String(currentDate.getDate()).padStart(2, "0"); // Dzień z wiodącym zerem
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Miesiąc z wiodącym zerem
  const year = String(currentDate.getFullYear()); // Rok

  // Formatowanie daty jako d-m-r
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}
