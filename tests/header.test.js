const pupp = require("puppeteer");
let browser, page;

beforeEach(async () => {
  //initialing the browser
  browser = await pupp.launch({
    headless: false
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
  console.log("url", url);
});
