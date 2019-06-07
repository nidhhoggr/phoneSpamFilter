module.exports = (app) => 
  (object, path, defaultValue) => 
    path.split('.').reduce((xs, x) => 
      (xs && typeof xs[x] !== "undefined" && xs[x] !== null) ? xs[x] : defaultValue, object)
