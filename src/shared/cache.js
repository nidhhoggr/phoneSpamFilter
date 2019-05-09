const util = require('util');

module.exports = (app) => {

  function debug() {
    return app.modules.debug('modules:cache')(arguments[0]);
  }

  function get({key, setterFn}, callback) {
    app.modules.redis.getAsync(key).then(res => {
      if (res) {
        debug(`Found ${res} from ${key}`);
        callback(undefined, {value: JSON.parse(res)});
      }
      else {
        setterFn((err, value) => {
          const stringified = JSON.stringify(value);
          debug(`Attempting to set ${key} to ${stringified}`);
          app.modules.redis.setAsync(key, stringified, 'EX', 60 * 60 * 24 * 7).then(result => {
            callback(undefined, {value, result});
          }).catch(callback);
        });
      }
    }).catch(callback);
  }

  const getAsync = util.promisify(get);

  return {
    get,
    getAsync
  };
}
