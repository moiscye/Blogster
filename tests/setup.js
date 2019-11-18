//time to wait before jest throws an error message
jest.setTimeout(10000);
//including the  User model
require("../models/User");

//require mongoose
const mongoose = require("mongoose");

//require keys
const keys = require("../config/keys");

//configuring mongoose to work with node global promise

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
