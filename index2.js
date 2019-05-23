const fs = require('fs-extra');
const assert = require('assert');
const puppeteer = require('puppeteer');

const user = ''; //TODO:
const pass = ''; //TODO:

(async() => {

  const browser = await puppeteer.launch({
    args:[
      //'--proxy-server=192.168.30.130:80', //TODO:プロキシ不要なら外す
      '--ignore-certificate-errors',
      '--no-sandbox',
      "--disable-setuid-sandbox",
      '--disable-gpu'],
    timeout: 0,
    headless: false,
    devtools: false,
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();

  //check if the page redirects
  let url_redirected = false;
  page.on('response', async (response) => {
    const status = response.status();
    //[301, 302, 303, 307, 308]
    if ((status >= 300) && (status <= 399)) {
      url_redirected = true;
    }
    console.log('url redirected.', response.url());
    if(response.url() === 'https://accounts.sap.com/saml2/idp/sso/accounts.sap.com'){
      try{
        //const response = await page.waitForNavigation({waitUntil:'domcontentloaded'});
        //const form_id = await page.focus('#j_username');
        //console.log(form_id);
      }catch(e){
        console.log('err2', e);
      }
    }
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
  //await page.goto('https://github.com/Quramy');
  const response = await page.goto('https://launchpad.support.sap.com');/*, {
    timeout:60000,
    waitUntil:'networkidle0'
  });*/
  console.log(response.request().frame().url());
  if(url_redirected){
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    });
  }
  try{
    //ログイン
    //const res2 = await page.waitForNavigation({waitUntil:'domcontentloaded'});
    const form_id = await page.waitForSelector('#j_username');
    await page.waitFor(2000);
    //console.log('form_id>>>',form_id);
    await form_id.type(user);
    const form_pw = await page.waitForSelector('#j_password');
    await form_pw.type(pass);
    //const logon_btn = await page.waitForSelector('#logOnFormSubmit');
    //await logon_btn.click();
    await page.evaluate(()=>document.querySelector('#logOnFormSubmit').click())
    const res2 = await page.waitForNavigation({waitUntil:'domcontentloaded'});
    console.log('res2>>>', res2);
    //const x = await page.content();
    //console.log('ok>>>', x);
  }catch(e){
    console.log('error>>>', e);
  }

  try{
    await page.waitFor(10000);
    const search_form = await page.waitForSelector('#search--searchCenterInputfield-I');
    //カテゴリー選択プルダウン
    const pulldown = await page.waitForSelector('#search--searchCenterSelectBox-arrow');
    await page.waitFor(1000);
    await pulldown.click();
    await page.waitFor(1000);
    await page.waitFor(1000);

    //カテゴリをナレッジベースに変更
    const knowledge_base = await page.waitForSelector('#idSolutions-search--searchCenterSelectBox-5');
    await page.waitFor(1000);
    await knowledge_base.click();
    await page.waitFor(1000);

    // SAP ONE SupportのTOPを待ってから検索へ
    const response = await page.goto('https://launchpad.support.sap.com/#/solutions/notesv2/?q=令和&sortBy=score&sortOrder=desc');
    //const res3 = await page.waitForNavigation({waitUntil:'domcontentloaded'});
    //console.log('res3>>>', res3);
    //const x = await page.content();
    //console.log('ok>>>', x);
  }catch(e){
    console.log('error3>>>', e);
  }

  try{
    //検索結果選択
    await page.waitFor(10000);
    const search_result = await page.waitForSelector('#notesv2--search--idIconTabFilterNotesList2-listUl');
    await page.waitFor(1000);
    const anchor = await search_result.$('a');
    await page.waitFor(1000);
    const result = await anchor.click();
  }catch(e){
    console.log('error4>>>', e);
  }

  try{
    //結果抽出
    await page.waitFor(10000);
    const elem = await page.waitForSelector('#__xmlview15--idObjectPageLayout');
    await page.evaluate(() => $('#__xmlview15--idObjectPageLayout-vertSB-sbcnt').removeAttr('style'));
    const div = await page.evaluate(()=>document.querySelector('#__xmlview15--idObjectPageLayout').innerHTML);
    console.log(div);
    await fs.remove('output.html');
    await fs.writeFile('output.html', '<html><body>' + div + '</body></html>');
  }catch(e){
    console.log('error5>>>', e);
  }
  /*
  try{
    // 検索
    await page.waitFor(10000);
    const search_form = await page.waitForSelector('#search--searchCenterInputfield-I');
    await page.waitFor(2000);
    await search_form.type('令和');
    await page.waitFor(1000);
    await page.evaluate(()=>document.querySelector('#search--searchCenterInputfield-I').blur())
    //await search_form.blur();
    await page.waitFor(1000);

    const pulldown = await page.waitForSelector('#search--searchCenterSelectBox-arrow');
    await page.waitFor(1000);
    await pulldown.click();
    await page.waitFor(1000);

    const knowledge_base = await page.waitForSelector('#idSolutions-search--searchCenterSelectBox-5');
    await page.waitFor(1000);
    await knowledge_base.click();
    await page.waitFor(1000);

    const search_btn = await page.waitForSelector('#search--searchCenterSearchButton');
    await page.waitFor(1000);
    await search_btn.focus();
    await page.waitFor(1000);
    await page.evaluate(()=>document.querySelector('#search--searchCenterSearchButton').click())
    await page.waitFor(1000);
    await search_btn.focus();
    await page.waitFor(1000);
    await page.evaluate(()=>document.querySelector('#search--searchCenterSearchButton').click())
    await page.waitFor(1000);
    await search_btn.focus();
    await page.waitFor(1000);
    await page.evaluate(()=>document.querySelector('#search--searchCenterSearchButton').click())
  }catch(e){
    console.log('error-search>>>', e);
  }
  */

  page.removeAllListeners('response');
  //await page.screenshot({path: 'example.png'});

  browser.close();
  //assert(fs.existsSync('example.png'));
  console.log('end.');
})();
