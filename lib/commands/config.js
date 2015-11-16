// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var common = require('../common.js');

var configFile = path.join(common.homeDir, 'config.json');
exports.configFile = configFile;

var config = null;

var supportedCommands = [ 'set' ];
var supportedParams = [ 'cache' ];

var help = common.getHelp('config');
exports.dontCheckCordova = true;

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


var setCache = function() {

  var parsedArgv = jxcore.utils.argv.parse();

  if (parsedArgv.readonly) {
    var _path = ' ' + process.argv.slice(2).join(' ') + ' ';
    var _remove = [ 'config', 'set', 'cache', 'readonly'];
    for(var o in _remove)
        _path = _path.replace(' ' + _remove[o] + ' ', '  ');

    _path = _path.trim();
    if (!_path)
      _path = path.resolve(_path);

    if (!_path || !fs.existsSync(_path))
      return { err : 'Invalid path: ' + _path }

    config.cache = {
        'readonly' : true,
        'path' : _path
    }
  } else {
    config.cache = true;
  }

  return true;
};

var set = function() {

  var parsedArgv = jxcore.utils.argv.parse();

  var ret = null;
  if (parsedArgv.cache)
    ret = setCache();
  else
    ret = {err: 'Invalid key.', txt : help };

  if (ret.err)
    return ret;

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
  return true;
};



exports.run = function (cb) {

  var ret = jxtools.checkHomeDir(common.appName);
  if (ret.err)
    return cb(ret.err);

  var cfg = exports.read();
  if (cfg.err)
    return cb(ret.err);

  var parsedArgv = jxcore.utils.argv.parse();

  // jx jxc config
  var justDisplay = process.argv.length === 3;

  if (!justDisplay) {
    var ret = null;
    if (parsedArgv.set)
      ret = set();

    if (!ret)
      return cb('Unknown command.', help);
    else if (ret.err)
      return cb(ret.err, ret.txt);
  }

  jxcore.utils.console.log(JSON.stringify(cfg, null, 4));
  cb();
};

