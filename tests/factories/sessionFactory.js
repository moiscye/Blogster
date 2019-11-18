const Buffer = require("safe-buffer").Buffer;

//this library is installed as  a dependency with cookie-session
const Keygrip = require("keygrip");

//requiring the keys file from config/
const keys = require("../../config/keys");

//instanciating a new Keygrip Object with the cookie key we defined
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {
  //passport object
  const sessionObject = {
    passport: {
      user: user._id.toString()
    }
  };

  //making the string that we can see in the Header of the request
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

  //creating the sign string
  const sig = keygrip.sign("express:sess=" + session);
  return { session, sig };
};
