import { setupBrowser } from "../setupBrowser/setupBrowser.js";
import { takeInnerText } from "../helpers/takeInnerText.js";
import { countSiblings } from "../helpers/countSiblings.js";
import { build } from "../helpers/build.js";
import { listOfBuildings } from "../data/listOfBuildings.js";
import { goals, settings } from "../data/settings.js";
import { delay } from "../utils/delay.js";
import { ElementHandle } from "puppeteer";

export async function buildManager() {
  const { page } = await setupBrowser();

  const {
    linkGoToPageResources,
    linkGoToDetailPageResources,
    linkGetActualMetalMineLvl,
    linkGetActualCrystalMineLvl,
    linkGetActualDeuteriumMineLvl,
    linkCheckIfQueingIsFull,
    linkBuildMetalMine,
    linkBuildCrystalMine,
    linkBuildDeuteriumMine,
  } = listOfBuildings;

  const pageResources: ElementHandle<Element> = await page.$(linkGoToPageResources);

  // Przechodzę do podstrony resources a potem do informacji o budynku, aby pojawiły się ukryte dane, jak czas i potrzebne surowce
  await pageResources.click();
  await delay();

  // Sprawdź czy kolejka budowania jest pusta
  let isFreeQueing;

  isFreeQueing = await checkQueing(linkCheckIfQueingIsFull);

  // Jeśli kolejka budowania jest pełna, wyjdź z funkcji
  if (isFreeQueing) {
    console.log("Kolejka budowania resources/facilities jest wolna!");
  } else {
    console.log("Kolejka budowania resources/facilities jest zajęta!");
    return;
  }

  const pageDetailResources = await page.$(linkGoToDetailPageResources);
  await pageDetailResources.click();
  await delay();

  const actualMetalMineLvl = Number(await takeInnerText(linkGetActualMetalMineLvl));
  const actualCrystalMineLvl = Number(await takeInnerText(linkGetActualCrystalMineLvl));
  const actualDeuteriumMineLvl = Number(await takeInnerText(linkGetActualDeuteriumMineLvl));

  console.log(
    "actualMetalMineLvl:",
    actualMetalMineLvl,
    "; actualCrystalMineLvl:",
    actualCrystalMineLvl,
    "; actualDeuteriumMineLvl:",
    actualDeuteriumMineLvl
  );

  // TODO zmienna isGoalAchieved powinna być chyba warunkiem podczas wywoływania funkcji? aby pominąć całą procedure przechodzenia do strony i pobierana elementów
  // Zmienna do pętli while, jeśli cel nie jest spełniony, to nadal budować budynki
  let isGoalAchieved = false;

  // Sprawdź czy cel został spełniony
  if (
    goals.GoalForMetalMineLvl === Number(linkGetActualMetalMineLvl) &&
    goals.GoalForCrystalMineLvl === Number(linkGetActualCrystalMineLvl) &&
    goals.GoalForDeuteriumMineLvl === Number(linkGetActualDeuteriumMineLvl)
  ) {
    console.log("Cel wybudowanych poziomów budynków został spełniony!");
    isGoalAchieved = true;
  }

  //TODO sprawdzić czy są surowce

  console.log("Przed pętlą while isGoalAchieved: ", !isGoalAchieved, !isFreeQueing);

  while (!isGoalAchieved && !isFreeQueing) {
    console.log("while");

    if (actualDeuteriumMineLvl < actualCrystalMineLvl - 1) {
      console.log("!builddeuter", linkBuildDeuteriumMine);
      await build(linkBuildDeuteriumMine);
      return;
    } else if (actualCrystalMineLvl < actualMetalMineLvl - 1) {
      console.log("!buildcrystal", linkBuildCrystalMine);
      await build(linkBuildCrystalMine);
      return;
    } else {
      console.log("!buildmetal", linkBuildMetalMine);
      await build(linkBuildMetalMine);
      return;
    }
  }
}

async function checkQueing(link) {
  const numberInQueing = await countSiblings(link);

  console.log("checkQueing - numberInqueing: ", numberInQueing, numberInQueing == settings.maxResourcesAndFacilitiesBuidingsQueingToUpgrade);

  if (numberInQueing < settings.maxResourcesAndFacilitiesBuidingsQueingToUpgrade) {
    return true;
  }

  return false;
}
