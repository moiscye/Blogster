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

describe("When logged in ", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("Should see blog create form", async () => {
    const text = await page.getContentsOf(".title label");
    expect(text).toEqual("Blog Title");
  });

  test("Should show an error if empty Title", async () => {
    await page.click("button");
    const errorText = await page.getContentsOf(".title div.red-text");

    expect(errorText).toEqual("You must provide a value");
  });

  test("Should show an error if empty Content", async () => {
    await page.click("button");
    const errorText = await page.getContentsOf(".content div.red-text");

    expect(errorText).toEqual("You must provide a value");
  });

  describe("using valid input", () => {
    beforeEach(async () => {
      await page.type(".title input", "My Blog");
      await page.type(".content input", "This is a test");
      await page.click("button");
      await page.waitFor("h5");
    });

    test("Should show the confirmation page ", async () => {
      const text = await page.getContentsOf("h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("Should submit the form and add the blog the index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const text = await page.getContentsOf("div .card-title");

      expect(text).toEqual("My Blog");
    });
  });
});

describe("User is not logged in", () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs"
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "T",
        content: "C"
      }
    }
  ];

  test("Blog related actions are prohibited", async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: "You must log in!" });
    }
  });
});
