const assert = require('assert');
const fetch = require('node-fetch');

module.exports = (app) => {

  debug = app.modules.debug('routes:spamScoreByPhoneNumber');

  return async function({req, res, next}) {

    if (req.query.phone_number && req.query.phone_number.length == 10) {
      req.query.phone_number = "1".concat(req.query.phone_number);
    }
    const {
      phone_number,
      byPath
    } = req.query;
    try {
      assert(phone_number, "phone number is required");
      assert(phone_number.length === 11, "country and area code required");
      assert(phone_number.substring(0, 1) == 1, "country code unsupported: " + phone_number.substring(0, 1));
    } 
    catch(err) {
      return next(err.message);
    }
    app.modules.cache.getAsync({
      key: `${app.config.local.namespace}:spamScoreByPhoneNumber:nomorobo_spamscore:${phone_number}`,
      setterFn: (cb) => {
        fetch(`https://${app.config.twilio.TWILIO_ACCOUNT_SID}:${app.config.twilio.TWILIO_AUTH_TOKEN}@lookups.twilio.com/v1/PhoneNumbers/+${phone_number}/?AddOns=nomorobo_spamscore`)
          .then(fRes => fRes.json())
          .then(json => cb(undefined, json))
          .catch(cb)
      }
    }).then(({value, result}) => {
      debug(JSON.stringify(value));
      if (byPath) {
        debug(byPath);
        res.send(app.modules.deepValue(value, byPath));
      }
      else {
        res.send(value);
      }
    }).catch(next);
  }
}
