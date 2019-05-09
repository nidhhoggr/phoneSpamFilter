const express = require('express');
const assert = require('assert');
const fetch = require('node-fetch');
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

  let k, sModule;
  const shared = requireDirectory(module, './src/shared/');
  for (k in shared) {
    sModule = shared[k];
    debug(k, sModule);
    debug(`Binding module (${k}) to modules context`);
    context.modules[k] = sModule(context);
  }

  let j, route;
  const routes = requireDirectory(module, './src/routes/get/');
  const method = "get";
  for (j in routes) {
    route = routes[j];
    debug(`Binding route (${j}) to routing as a (${method}) method`);
    app.get(`/api/v1/${j}`, [authorize], (req, res, next) => route(context)({req, res, next}));
  }

  app.listen(port, () => debug(`Example app listening on port ${port}!`));
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
