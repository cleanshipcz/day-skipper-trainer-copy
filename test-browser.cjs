const { chromium } = require("playwright");

(async () => {
  console.log("Attempting to launch browser...");
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("Browser launched successfully");
    const page = await browser.newPage();
    await page.goto("http://localhost:8081");
    console.log("Navigated to page: " + (await page.title()));
    await browser.close();
    console.log("Browser closed");
  } catch (e) {
    console.error("Failed to launch browser:", e);
  }
})();
