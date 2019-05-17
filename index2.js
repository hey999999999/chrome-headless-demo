const fs = require('fs');
const assert = require('assert');
const puppeteer = require('puppeteer');

(async() => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //await page.goto('https://github.com/Quramy');
  await page.goto('https://launchpad.sap.com');
  //await page.screenshot({path: 'example.png'});
  const x = await page.content();
  console.log(x);

  browser.close();
  //assert(fs.existsSync('example.png'));
  console.log(' 🎉 ');
})();
