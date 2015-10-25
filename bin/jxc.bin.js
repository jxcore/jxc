#!/usr/bin/env jx

// Copyright & License details are available under JXCORE_LICENSE file

var jxtools = require('jxtools');
var fs = require('fs');
var path = require('path');

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

require(path.join('../lib/commands', argv2 + '.js')).run(function(err) {
  if (err)
    jxcore.utils.console.error(err);
});
