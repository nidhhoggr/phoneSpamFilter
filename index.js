const express = require('express');
const assert = require('assert');
const requireDirectory = require('require-directory');
const config = require('./src/config/config');
const debug = require('./src/shared/debug')({config})('boot');

bootload();

function bootload() {
  const app = express();
  const port = config.local.port;

  const context = {
    express: app,
    config,
    modules: {}
  };

  let k;
  const shared = requireDirectory(module, './src/shared/');
  for (k in shared) {
    const sModule = shared[k];
    debug(k, sModule);
    debug(`Binding module (${k}) to modules context`);
    context.modules[k] = sModule(context);
  }

  bindRoutesByMethod({method: "get", context});

  app.listen(port, () => debug(`Example app listening on port ${port}!`));
}

function bindRoutesByMethod({method, context}) {
  let j;
  const routes = requireDirectory(module, `./src/routes/${method}/`);
  for (j in routes) {
    const route = routes[j];
    debug(`Binding route (${j}) to routing as a (${method}) method`);
    context.express[method](`/api/v1/${j}`, [authorize], (req, res, next) => route(context)({req, res, next}));
  }
}

function authorize(req, res, next) {
  const { 
    access_token
  }  = req.query;
  let err = undefined;
  if (access_token != config.access_token.id) {
    err = new Error("now allowed");
  }
  next(err);
}
