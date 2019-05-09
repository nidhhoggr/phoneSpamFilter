module.exports = (app) => {

  debug = app.modules.debug('routes:nomoroboScoreFromBash');

  return async function({req, res, next}) {
    const {
      phone_number
    } = req.query;
    assert(phone_number, "phone number is required");
    const env = {"PHONE_NUMBER": phone_number, ...config.twilio};
    const twilioUtil = __dirname + '/nomoroboSpamScore.sh'
    try {
      const result = await app.modules.execUtils.execCmd(`${twilioUtil}`, {env});
      debug(result);
      let s = "";
      res.send(result.results.map(r => s.concat(r)));
    } catch(err) {
      debug(err.message);
      next(err);
    }
  }
}
