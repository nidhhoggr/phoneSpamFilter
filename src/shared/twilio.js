const fetch = require('node-fetch');
const assert = require('assert');
module.exports = (app) => {

  function debug() {
    return app.modules.debug('modules:twilio')(arguments[0])
  }

  function isSpamFromLookupResponse(args) {
     const {
      response,
      addon
    } = args;
    const addonResponseEval = app.config.twilio.response_eval[addon];
    const conditionOperator = Object.keys(addonResponseEval.condition)[0];
    const conditionThresholdValue = addonResponseEval.condition[conditionOperator];
    const addonScoreResult = app.modules.deepValue(response, `add_ons.results.${addon}.${addonResponseEval.result_prop}`);
    assert(conditionOperator, `Could not parse condition operator for ${addon}`);
    assert(typeof addonScoreResult !== undefined || addonScoreResult !== null, `Could not parse result from addon response for ${addon} from property ${addonResponseEval.result_prop}`);
    switch (conditionOperator) {
      case "gte": {
        return parseInt(addonScoreResult) >= parseInt(conditionThresholdValue);
      }  
      default: 
        throw new Error("Condition is not supported");
    }
  }

  function lookup(args, cb) {
    const {
      phone_number,
      addon
    } = args;
    assert(addon, "Addon is required");
    const url = `https://${app.config.twilio.TWILIO_ACCOUNT_SID}:${app.config.twilio.TWILIO_AUTH_TOKEN}@lookups.twilio.com/v1/PhoneNumbers/+${phone_number}/?AddOns=${addon}`;
    debug(`Fetching ${url}`);
    fetch(url)
      .then(fRes => fRes.json())
      .then(json => {
        debug(json);
        return cb(undefined, json);
      })
      .catch(cb) 
  }

  const lookupAsync = require('util').promisify(lookup);

  return {
    lookup,
    lookupAsync,
    isSpamFromLookupResponse
  };
}
