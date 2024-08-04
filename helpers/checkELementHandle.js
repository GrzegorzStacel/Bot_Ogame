const { setupBrowser } = require("../setupBrowser/setupBrowser");

async function checkELementHandle(element) {
  const blue = "\x1b[34m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";

  const { page } = await setupBrowser();
  const outerHTML = await page.evaluate((el) => el.outerHTML, element);
  console.log(`${blue}Outer HTML of the element: `, `${yellow}${outerHTML}${reset}`);
}

module.exports = { checkELementHandle };
