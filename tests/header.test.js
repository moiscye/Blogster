const pupp = require("puppeteer");
let browser, page;

beforeEach(async () => {
  //initialing the browser
  browser = await pupp.launch({
    headless: true
  });

  //creating a new page
  page = await browser.newPage();

  //navigating to localhost:3000
  await page.goto("http://localhost:3000/");
});

afterEach(async () => {
  await browser.close();
});

test("Header should have the correct text", async () => {
  //fetching an element
  const logo = await page.$eval("a.brand-logo", el => el.innerHTML);

  expect(logo).toEqual("Blogster");
});

test("clicking login start oauth flow", async () => {
  await page.click(".right li a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test.only("when signed in, show the log out button", async () => {
  //id from User stored in MongoDB
  const id = "5dc8e2de93bac55d6879db0e";

  //converting long string into a passport user
  const Buffer = require("safe-buffer").Buffer;

  //passport object
  const sessionObject = {
    passport: {
      user: id
    }
  };

  //making the string that we can see in the Header of the request
  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString(
    "base64"
  );

  //this library is installed as  a dependency with cookie-session
  const Keygrip = require("keygrip");

  //requiring the keys file from config/
  const keys = require("../config/keys");

  //instanciating a new Keygrip Object with the cookie key we defined
  const keygrip = new Keygrip([keys.cookieKey]);

  //creating the sign string
  const sessionSig = keygrip.sign("express:sess=" + sessionString);

  //setting the cookies so we can fake the google log in
  await page.setCookie({ name: "express:sess", value: sessionString });
  await page.setCookie({ name: "express:sess.sig", value: sessionSig });

  //refreshing the page
  await page.goto("http://localhost:3000/");

  //waiting so the page render the html
  await page.waitFor('a[href="/api/logout"]');

  //fetching the button
  const logout = await page.$eval('a[href="/api/logout"]', el => el.innerHTML);

  expect(logout).toEqual("Logout");
});
