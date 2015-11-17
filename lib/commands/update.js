// Copyright & License details are available under JXCORE_LICENSE file

var path = require('path');
var common = require('../common.js');
var install = require('./install.js');


exports.run = function (cb) {

  var parsedArgv = jxcore.utils.argv.parse();

  common.getLatestCordovaVersion(function(err, version) {
    if (err)
      jxcore.utils.console.error(err);
    else {
      var currentVersion = common.getInstalledPluginInfo();
      if (currentVersion.version === version && !parsedArgv['force-download'])
        return cb(false, 'You have already the latest version of jxcore-cordova ' + version + ' installed for this application.');

      if (!parsedArgv.force) {
        process.argv.push('--force');
        jxcore.utils.argv.parse({force : true});
      }

      install.run(cb);
    }
  });

};

