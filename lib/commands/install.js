// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';


var unpack = function (cb) {

  var commands = [];

  var folder = path.join(process.cwd(), dname);
  if (fs.existsSync(folder)) {
    commands.push({
      name: 'remove_plugin',
      command: 'cordova plugins remove ' + dname,
      caption: 'Removing plugin from project...',
      skip_error: true
    });
    commands.push({
      name: 'remove_dir',
      command: jxtools.fs.getRmdirCommand(folder),
      caption: 'Removing previous plugin\'s folder...'
    });
  }

  // extract package
  commands.push({
    name: 'extract',
    command: '"' + process.execPath + '" ' + fname,
    caption: 'Extracting plugin package...'
  });

  // add plugin
  commands.push({
    name: 'add_plugin',
    command: 'cordova plugins add ' + dname,
    caption: 'Adding plugin to project...'
  });

  jxtools.fs.execMultiple(commands, function (ret) {
    if (ret.errors)
      jxcore.utils.console.error(ret.errors);
    else {
      var parsedArgv = jxcore.utils.argv.parse();
      if (parsedArgv.sample) {
        var sample = require('./sample.js');
        sample.run(parsedArgv.sample.value);
      }

      jxcore.utils.console.info("Done.");
    }
  });
};


exports.run = function (cb) {

  var localFile = path.join(process.cwd(), fname);

  var parsedArgv = jxcore.utils.argv.parse();

  if (fs.existsSync(localFile) && !parsedArgv.force) {
    jxcore.utils.console.warn('Skipping the download, since file', fname, 'already exists.');
    jxcore.utils.console.log('If you want to force downloading, use --force option.');
    unpack(cb);
    return;
  }

  var url = 'https://raw.githubusercontent.com/jxcore/jxcore-cordova-release/master/0.0.5/' + fname;
  jxtools.http.download(url, fname, function (err) {
    if (!err)
      unpack(cb);
  });


};