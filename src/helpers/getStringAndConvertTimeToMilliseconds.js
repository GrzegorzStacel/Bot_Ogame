export function getStringAndConvertTimeToMilliseconds(timeStr) {
  if (timeStr === null || timeStr === undefined) {
    throw new Error("Ciąg wejściowy nie może być null lub undefined");
  }

  // Używamy wyrażenia regularnego, aby znaleźć czas w formacie MM:SS
  const match = timeStr.match(/(\d{2}):(\d{2})/);

  if (!match) {
    throw new Error("Ciąg wejściowy nie zawiera prawidłowego formatu MM:SS");
  }

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error("Ciąg wejściowy zawiera nieprawidłowe liczby");
  }

  // Konwersja na milisekundy
  const milliseconds = (minutes * 60 + seconds) * 1000;
  return milliseconds;
}
