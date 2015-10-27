#!/usr/bin/env jx

// Copyright & License details are available under JXCORE_LICENSE file

var jxtools = require('jxtools');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

if (jxtools.onlyForJXcore())
  return;


if (process.argv.length <= 2) {
  console.log("Too little arguments.");
  process.exit();
}

var argv2 = process.argv[2].replace("--", "");

var files = fs.readdirSync(path.join(__dirname,  '../lib/commands'));
if (files.indexOf(argv2 + '.js') === -1) {
  jxcore.utils.console.error('Unknown command', argv2);
  process.exit(-1);
}

cp.exec('cordova info', function (error, stdout, stderr) {
  if (error) {
    jxcore.utils.console.error(stderr);
    return;
  }

  require(path.join('../lib/commands', argv2 + '.js')).run(function(err, txt) {
    if (err)
      jxcore.utils.console.error(err);
    if (txt)
      jxcore.utils.console.log(txt);
  });
});


