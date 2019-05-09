const bluebird = require('bluebird');
const redis = require('redis');

module.exports = (app) => {

  return connect();

  function debug() {
    return app.modules.debug('modules:redis')(arguments[0]);
  }

  function connect() {
    
    bluebird.promisifyAll(redis);
    
    const client = redis.createClient({
      password: app.config.redis.pass
    });

    client.on("error", function (err) {
      if(err && err.message) err = err.message;
      debug('REDIS Error Event triggered:', err);
    });

    return client;
  }
}
