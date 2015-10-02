#!/usr/bin/env jx

// Copyright & License details are available under JXCORE_LICENSE file

var jxtools = require('jxtools');

if (jxtools.onlyForJXcore())
  return;


if (process.argv.length <= 2) {
  console.log("Too little arguments.");
  process.exit();
}

var argv2 = process.argv[2].replace("--", "");

if (argv2 === "install") {
  require("../lib/commands/install.js").run();
}


if (argv2 === "sample") {
  require("../lib/commands/sample.js").run();
}