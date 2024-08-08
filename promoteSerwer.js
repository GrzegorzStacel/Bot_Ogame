import puppeteer from "puppeteer";
import { delay } from "./utils/delay.js";

export async function promoteSerwer(LeftMenu, page, browser, index) {
  try {
    //TODO sprawdzić, kod był w bonus.js
    // const isAvailable = await page.$(".x-vote-time");
    // if (!isAvailable) {
    //   console.log("Można głosować!");
    // } else {
    //   const takeTime = takeInnerText(isAvailable);

    //   const time = addTimeToCurrentTime(takeTime);
    //   console.log(`Trzeba czekać na głosowanie do ${time} :(`);
    //   return;
    // }

    // Kliknij w ankiety aby zdobyć dark matter
    const promoteServer = await LeftMenu.$('a[href="/darkmatter/promote"]');

    if (promoteServer) {
      await promoteServer.click();
      console.log('Kliknięto na Button "Promote Server"');
    } else {
      console.log('Nie znaleziono Buttona "Promote Server"');
    }

    await delay();

    const section = await page.$(`.promote-section > :nth-child(${index}) .provider-vote`);
    if (!section) {
      console.log(`Nie znaleziono pomocyjnego elementu '.provider-vote', dziecka nr ${index}, wychodzę z funkcji.`);
      return;
    }

    const isAvailable = await section.$(".x-vote-time");

    if (isAvailable) {
      return;
    }

    const promotion = await section.$(`a`);

    if (promotion) {
      await promotion.click();
      // await promotion.click('a[target="_blank"]');
      console.log("Znaleziono promocje");
    } else {
      console.log("Nie znaleziono promocji");
    }

    // Pobierz wszystkie otwarte strony
    // const pages = await browser.pages();
    // let newPage = pages[pages.length - 1]; // Nowa zakładka jest na końcu tablicy

    // Przejdź do nowej zakładki i wykonaj operacje
    // TopG
    //   const vote = await newPage.$("button[data-targe'#voteModal']");

    // Wykonaj operacje na nowej zakładce
    // await delay(3000);
    // Zamknij nową zakładkę
    // await newPage.close();

    // Wróć do poprzedniej zakładki (może być aktywna jeszcze w pages[0])
    // await pages[0].bringToFront(); // Przełącz na pierwszą zakładkę

    // Można kontynuować działania na pierwszej zakładce
    // await pages[0].waitFor(2000); // Przykładowe oczekiwanie
  } catch (error) {
    console.error("Wystąpił błąd:", error);
  }
}

function addTimeToCurrentTime(timeString) {
  // Podział czasu na godziny, minuty i sekundy
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  // Obliczenie łącznej liczby sekund do dodania
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Pobranie aktualnego czasu
  const currentTime = new Date();

  // Dodanie łącznej liczby sekund
  const newTime = new Date(currentTime.getTime() + totalSeconds * 1000);

  // Zwrócenie nowego czasu
  return newTime;
}
