const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

const sleep = (millis) => new Promise((resolve) => setTimeout(resolve, millis));

(async function() {
  async function launchChrome() {
    return await chromeLauncher.launch({
      chromeFlags: [
        '--disable-gpu',
        '--headless',
        //'--remote-debugging-port=9222'
      ]
    });
  }
  const chrome = await launchChrome();
  const protocol = await CDP({
    port: chrome.port
  });

  // ALL FOLLOWING CODE SNIPPETS HERE
  const { DOM, Page, Emulation, Runtime } = protocol;
  await Promise.all([Page.enable(), Runtime.enable(), DOM.enable()]);

  //try{
  const p = new Promise(async (resolve) => {
    //const url = 'https://launchpad.sap.com';
    const url = 'https://www.yahoo.co.jp';
    const x = await Page.navigate({ url: url });
    console.log(x);
    //await sleep(1000);
    console.log('>>1');
    const y = Page.loadEventFired(async() => {
      console.log('>>2');
      const script1 = "document.querySelector('html').innerHTML"
      // Evaluate script1
      const result = await Runtime.evaluate({ expression: script1 });
      console.log(result);
      console.log(result.result.value);
      resolve(result);
    });
  });
    //y();
  //}catch(e){
  //  console.log(e);
  //}
  p.then((v) => {
    protocol.close();
    chrome.kill();
  });
})();
