const util = require('util');

module.exports = (app) => {

  function set({key, value}) {
    let setter;
    const { caching_ttl } = app.config.local;
    if (caching_ttl) {
      setter = app.modules.redis.setAsync(key, value, 'EX', caching_ttl);
    }
    else {
      setter = app.modules.redis.setAsync(key, value);
    }
    return setter;
  }

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
          set({key, value: stringified}).then(result => {
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
