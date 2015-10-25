// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var common = require('../common.js');

var configFile = path.join(common.homeDir, 'config.json');
var config = null;

var supportedCommands = [ 'set' ];
var supportedParams = [ 'offline-dir' ];

exports.read = function() {

  if (config)
    return config;

  var ret = jxtools.checkHomeDir(common.appName);
  if (ret.err)
    return ret;

  if (!fs.existsSync(configFile))
    config = {};
  else {
    try {
      config = JSON.parse(fs.readFileSync(configFile).toString());
    } catch(ex) {
      return {err : 'Cannot parse ' + configFile + ":\n" + ex };
    }
  }

  return config;
};


var set = function(paramName, paramValue) {

  if (!paramName || supportedParams.indexOf(paramName) === -1)
    return {err: 'Unsupported param: ' +paramName};

  var cfg = exports.read();
  if (cfg.err)
    return cfg;

  if (!paramValue) {
    return {err: 'Please provide a value for a parameter ' +paramName + '.'};
  } else {
    cfg[paramName] = paramValue;
  }

  if (paramName === 'offline-dir') {
    if (!fs.existsSync(paramValue))
      return {err: 'The given path does not exists: ' +paramValue + '.'};
  }


  return save();
};



var save = function() {

  try {
    var str = JSON.stringify(config, null, 4);
    fs.writeFileSync(configFile, str);
  }catch(ex) {
    return {err: 'Cannot save config value: ' + ex};
  }

  jxcore.utils.console.info('New config is successfully saved:');
  jxcore.utils.console.info(str);
  return true;
};



exports.run = function (cb) {

  var ret = jxtools.checkHomeDir(common.appName);
  if (ret.err)
    return cb(ret.err);

  var argv3 = process.argv[3];

  if (argv3 && argv3.slice(0, 1) === '-')
    argv3 = null;

  if (argv3) {
    if (supportedCommands.indexOf(argv3) === -1)
      return cb('Unknown command: ' + argv3 + '.');

    var argv4 = process.argv[4];
    if (!argv4)
      return cb('Please provide a parameter name.');

    if (argv3 === 'set') {
      var ret = set(process.argv[4], process.argv[5]);
    } else if (argv3 === 'clear') {
    }

    if (ret.err)
      return cb(ret.err);

  } else {
    var cfg = exports.read();
    if (cfg.err)
      return cb(ret.err);
    else {
      jxcore.utils.console.log(JSON.stringify(cfg, null, 4));
      cb();
    }
  }

};

