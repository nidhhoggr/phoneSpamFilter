const debug = require('debug');
module.exports = (app) => {
  return (subNamespace) => debug(`${app.config.local.namespace}:${subNamespace}`);
}
