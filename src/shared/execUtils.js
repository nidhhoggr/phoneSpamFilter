const { exec } = require('child_process');

function execCmd(cmd, options) {
  console.log(`executing ${cmd}`);
  return new Promise( (resolve, reject) => {
    exec(cmd, options, (err, stdout, stderr) => {
      if(err) {
        reject(err);
      }
      else {
        const results = (stdout) ? stdout.split('\n') : [];
        resolve({stdout, stderr, results});
      }
    });
  });
}

module.exports = {
  execCmd
};
