// Copyright & License details are available under JXCORE_LICENSE file

var jxtools = require('jxtools');
var path = require('path');
var fs = require('fs');
var os = require('os');

exports.appName = 'jxc';
exports.homeDir = path.join(jxtools.homeDir, '.' + exports.appName);
exports.cacheDir = path.join(exports.homeDir, 'cache');


exports.getHelp = function(command) {

  var f = path.join(__dirname, 'help', command + '.txt');
  var fjxc = path.join(__dirname, 'help', 'jxc.txt');

  var file = fjxc;
  if (fs.existsSync(f))
    file = f;

  return fs.readFileSync(file).toString().trim() + os.EOL;
};