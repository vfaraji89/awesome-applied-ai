// Renders every piece of kit.html to PNG at its exact size: node brand/render.cjs
const { chromium } = require("playwright");
const path = require("path");
const pieces = { mark: [512, 512], "mark-dark": [512, 512], favicon: [64, 64], icon: [180, 180], lockup: [1200, 300], "social-preview": [1280, 640], og: [1200, 630], linkedin: [1584, 396], "linkedin-min": [1584, 396], x: [1500, 500], sheet: [1600, 800] };
(async () => {
  const b = await chromium.launch();
  for (const [k, [w, h]] of Object.entries(pieces)) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto("file://" + path.join(__dirname, "kit.html") + "?k=" + k);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(__dirname, k + ".png"), omitBackground: k === "mark" || k === "favicon" });
    await p.close();
  }
  await b.close();
})();
