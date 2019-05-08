const express = require('express');
const assert = require('assert');
const fetch = require('node-fetch');
const execUtils = require('./src/shared/execUtils');
const config = require('./src/config/config');

bootload();

function bootload() {
  const app = express();
  const port = 3001;
  app.get('/api/v1/phoneNumber', [authorize], (req, res, next) => handleFetchByPhoneNumber({req, res, next}));
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
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

async function handlePhoneNumber({req, res, next}) {
  const {
    phone_number
  } = req.query;
  assert(phone_number, "phone number is required");
  const env = {"PHONE_NUMBER": phone_number, ...config.twilio};
  const twilioUtil = __dirname + '/nomoroboSpamScore.sh'
  try {
    const result = await execUtils.execCmd(`${twilioUtil}`, {env});
    console.log(result);
    let s = "";
    res.send(result.results.map(r => s.concat(r)));
  } catch(err) {
    console.error(err.message);
    next(err);
  }
}

async function handleFetchByPhoneNumber({req, res, next}) {
  const {
    phone_number
  } = req.query;
  assert(phone_number, "phone number is required");
  fetch(`https://${config.twilio.TWILIO_ACCOUNT_SID}:${config.twilio.TWILIO_AUTH_TOKEN}@lookups.twilio.com/v1/PhoneNumbers/+${phone_number}/?AddOns=nomorobo_spamscore`)
    .then(fRes => fRes.json())
    .then(json => {
      console.log(json);
      res.send(json);
    })
    .catch(next);
}
