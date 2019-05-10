module.exports = (app) => 
  (object, path, defaultValue) => 
    path.split('.').reduce((xs, x) => 
      (xs && xs[x]) ? xs[x] : defaultValue, object)
