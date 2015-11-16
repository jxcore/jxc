// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';
var common = require('../common.js');
var config = require('./config.js');
var download = require('./download.js');

var localFile = path.join(process.cwd(), fname);
var folder = path.join(process.cwd(), dname);

var help = common.getHelp('install');


var install = function (cb) {

  var commands = [];
  var cfg = config.read();

  commands.push({
    name: 'remove_plugin',
    command: 'cordova plugins remove ' + dname,
    caption: 'Removing plugin from project...',
    skipError: true
  });

  commands.push({
    name: 'add_plugin',
    command: 'cordova plugins add ' + dname,
    caption: 'Adding plugin to project...'
  });

  commands.push({
    name: 'remove_dir_after',
    command: jxtools.fs.getRmdirCommand(folder),
    caption: 'Cleaning up...'
  });

  jxtools.fs.execMultiple(commands, function (ret) {
    if (ret.errors)
      return cb(ret.errors);
    else {
      var sampleName = jxcore.utils.argv.getValue('sample');
      if (sampleName) {
        var sample = require('./sample.js');
        sample.useSample(sampleName, function (err) {
          if (!err)
            jxcore.utils.console.info("Done.");

          cb(err);
        });
      } else {
        jxcore.utils.console.info("Done.");
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

  var force = parsedArgv.force || parsedArgv['force-download'];

  var plugin_installed_folder = path.join(process.cwd(), 'plugins', dname);
  if (fs.existsSync(plugin_installed_folder) && !force) {
    jxcore.utils.console.warn('Skipping the installation, since plugin is already added.');
    jxcore.utils.console.log('If you want to force installing, use --force option or remove the plugin:');
    jxcore.utils.console.log('    > cordova plugins remove ' + dname);
    return;
  }

  download.run(function(err) {
    if (err)
      return cb(err);

    install(cb);
  });

};

