// Copyright & License details are available under JXCORE_LICENSE file

var jxtools = require('jxtools');
var path = require('path');
var fs = require('fs');
var os = require('os');

exports.appName = 'jxc';
exports.homeDir = path.join(jxtools.homeDir, '.' + exports.appName);
exports.cacheDir = path.join(exports.homeDir, 'cache');


exports.packageName = 'io.jxcore.node.jx';
exports.pluginName = 'io.jxcore.node';
exports.localPluginPackage = path.join(process.cwd(), exports.packageName);
exports.localPluginFolder = path.join(process.cwd(), exports.pluginName);

var latestCordovaVersion = null;

exports.getHelp = function(command) {

  var f = path.join(__dirname, 'help', command + '.txt');
  var fjxc = path.join(__dirname, 'help', 'jxc.txt');

  var file = fjxc;
  if (fs.existsSync(f))
    file = f;

  return fs.readFileSync(file).toString().trim() + os.EOL;
};

exports.getLatestCordovaVersion = function (cb) {

  if (latestCordovaVersion)
    return cb(null, latestCordovaVersion);

  var _url = 'https://raw.githubusercontent.com/jxcore/jxcore-cordova/master/package.json';
  jxtools.http.downloadString(_url, {silent: true}, function (err, json_str) {
    if (!err) {
      var version = 'unknown';
      try {
        var json = JSON.parse(json_str);
        version = json.version;
        latestCordovaVersion = version;
      } catch (ex) {
        return cb("Cannot parse package.json: " + ex);
      }

      cb(false, version);
    } else {
      cb(err);
    }
  });
};


exports.getInstalledPluginInfo = function() {

  var plugin_installed_folder = path.join(process.cwd(), 'plugins', exports.pluginName);
  var ret = { dir : plugin_installed_folder};
  if (!fs.existsSync(plugin_installed_folder))
    return {};

  var json_file = path.join(plugin_installed_folder, 'package.json');
  try {
    var json = JSON.parse(fs.readFileSync(json_file));
    ret.version = json.version;
    return ret;
  } catch (ex) {
    return {err : 'Cannot parse package.json: ' + ex};
  }
};