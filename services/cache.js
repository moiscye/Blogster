//patching mongoose exec function
//this code will alter the function so we can
//implement caching in an unique manner
const mongoose = require("mongoose");
const redis = require("redis");

//this is requeri to promisify redis client
const util = require("util");

//setting up redis
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);

//promisifying the 'clientget' function
client.hget = util.promisify(client.hget);

//saving the pristine exec function for later use
const exec = mongoose.Query.prototype.exec;

//in here we redefine the exec function
//notice the use of the word function()
//so we can use 'this'  so not possinle to use
//arrow functions here
mongoose.Query.prototype.exec = async function() {
  //'this.isCache' comes from the 'cache' function defined in this file
  if (!this.isCached) return exec.apply(this, arguments);

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  const cacheValue = await client.hget(this.hashKey, key);

  if (cacheValue) {
    // parsing the cache value to JSON format
    const doc = JSON.parse(cacheValue);

    //check whether is  a single object or an array of objects
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  //executing the query to fetch mongoDB data
  const result = await exec.apply(this, arguments);

  //saving the query into the redis client
  client.hmset(this.hashKey, key, JSON.stringify(result), "EX", 10);

  return result;
};

//creating a 'cache' function into mongoose.Query.prototype

mongoose.Query.prototype.cache = function(options = {}) {
  //'isCached' is a random name
  this.isCached = true;

  // 'hashKey' is a random name
  this.hashKey = JSON.stringify(options.key || "");

  //return 'this' so the function is chainable
  return this;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
