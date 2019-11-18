// this helper is created to refactor our code
//also extends the Page class from puppeteer
//the main reason is that we can use one class for most methods under one name

const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    //initialing the browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    //creating a new page
    const page = await browser.newPage();

    //assigning the page class to CustomPage class
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    //setting the cookies so we can fake the google log in
    await this.page.setCookie({ name: "express:sess", value: session });
    await this.page.setCookie({ name: "express:sess.sig", value: sig });

    //refreshing the page
    await this.page.goto("http://localhost:3000/blogs");

    //waiting so the page render the html
    await this.page.waitFor('a[href="/api/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;
