const assert = require('assert');

module.exports = (app) => {

  const routeName = 'spamScoreByPhoneNumber';

  debug = app.modules.debug(`routes:${routeName}`);

  function cachingTwilioLookup({args}) {
    const {
      phone_number,
      addon
    } = args;
    return app.modules.cache.getAsync({
      key: `${app.config.local.namespace}:${routeName}:${addon}:${phone_number}`,
      setterFn: (cb) => {
        app.modules.twilio.lookup({
          phone_number,
          addon
        }, cb);
      }
    });
  }

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

    let addonName, i, lookupResponse, isSpamFromResponse = false;
    for (i in app.config.twilio.supportedAddons) {
      addonName = supportedAddons[i];
      try {
        lookupResponse = await cachingTwilioLookup({args: {
          phone_number,
          addon: addonName
        }});
        isSpamFromResponse = app.modules.twilio.isSpamFromLookupResponse({
          response: lookupResponse.value,
          addon: addonName
        });
      }
      catch(err) {
        debug(err);
      }
      //if its found to spam by any provider we honor it
      if (isSpamFromResponse) break;
    }
    res.send({
      is_spam: isSpamFromResponse
    });
  }
}
