// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';
var common = require('../common.js');

var localFile = path.join(process.cwd(), fname);
var folder = path.join(process.cwd(), dname);

var unpack = function (cb) {

  var commands = [];

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
      var sampleName = jxcore.utils.argv.getValue('sample');
      if (sampleName) {
        var sample = require('./sample.js');
        sample.useSample(sampleName, function(err) {
          if (!err)
            jxcore.utils.console.info("Done.");
        });
      }
    }
  });
};


exports.run = function (cb) {

  var parsedArgv = jxcore.utils.argv.parse();

  if (fs.existsSync(localFile)) {
    var stat = fs.statSync(localFile);
    if (stat.size < 1024 * 1024)
      fs.unlinkSync(localFile);
  }

  if (fs.existsSync(localFile) && !parsedArgv.force) {
    jxcore.utils.console.warn('Skipping the download, since file', fname, 'already exists.');
    jxcore.utils.console.log('If you want to force downloading, use --force option.');
    unpack(cb);
    return;
  }

  if (fs.existsSync(folder) && !parsedArgv.force) {
    jxcore.utils.console.warn('Skipping the installation, since folder', dname, 'already exists.');
    jxcore.utils.console.log('If you want to force installing, use --force option.');
    return;
  }

  var argv3 = process.argv[3];
  if (argv3 && argv3.slice(0,1) === '-')
    argv3 = null;
  var knownVersions = [ '0.0.4', '0.0.5', '0.0.7' ];
  var latest = knownVersions[knownVersions.length - 1];
  if (!argv3)
    argv3 = latest;
  else {
    if (knownVersions.indexOf(argv3) === -1) {
      jxcore.utils.console.error('Unknown version', argv3);
      return;
    }
  }

  var url = 'https://raw.githubusercontent.com/jxcore/jxcore-cordova-release/master/' + argv3 + '/' + fname;
  jxtools.http.download(url, fname, function (err) {
    if (!err)
      unpack(cb);
  });


};