const Page = require("./helpers/page");
let page;

beforeEach(async () => {
  page = await Page.build();

  //navigating to localhost:3000
  await page.goto("http://localhost:3000/");
});

afterEach(async () => {
  await page.close();
});

test("Header should have the correct text", async () => {
  //fetching an element
  const logo = await page.getContentsOf("a.brand-logo");

  expect(logo).toEqual("Blogster");
});

test("clicking login start oauth flow", async () => {
  await page.click(".right li a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in, show the log out button", async () => {
  await page.login();
  //fetching the button
  const text = await page.getContentsOf('a[href="/api/logout"]');

  expect(text).toEqual("Logout");
});
