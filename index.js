const express = require('express');
const assert = require('assert');
const execUtils = require('./src/shared/execUtils');
const config = require('./src/config/config');

bootload();

function bootload() {
  const app = express();
  const port = 3001;
  app.get('/api/v1/phoneNumber', [authorize], (req, res) => handlePhoneNumber({req, res}));
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

async function handlePhoneNumber({req, res}) {
  const {
    phone_number
  } = req.query;
  assert(phone_number, "phone number is required");
  const env = {"PHONE_NUMBER": phone_number, ...config.twilio};
  const twilioUtil = __dirname + '/nomoroboSpamScore.sh'
  const result = await execUtils.execCmd(`${twilioUtil}`, {env});
  console.log(result);
  res.send(result);
}
