// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';


exports.run = function () {

  if (process.argv[2] !== 'sample')
    return;

  process.argv[2] = '--sample';
  var parsedArv = jxcore.utils.argv.parse({force: true});

  exports.useSample(parsedArv.sample.value)
};


exports.useSample = function (sampleName) {

  var dir = path.resolve(sampleName);
  if (!fs.existsSync(dir))
    dir = path.join(process.cwd(), dname, 'sample', sampleName);

  if (!fs.existsSync(dir)) {
    jxcore.utils.console.error('Wrong sample name:', sampleName);
    return;
  }

  if (path.basename(dir) !== 'www')
    dir = path.join(dir, 'www');

  var www = path.join(process.cwd(), "www");
  var backup_www = path.join(process.cwd(), "www_backup");

  if (!fs.existsSync(backup_www)) {
    jxtools.fs.copySync(www, backup_www);
  }

  var commands = [];

  var package_json = path.join(dir, "jxcore/package.json");
  var node_modules = path.join(dir, "jxcore/node_modules");

  if (fs.existsSync(package_json) && !fs.existsSync(node_modules)) {
    commands.push({
      name: "install modules",
      command: '"' + process.execPath + '" install',
      cwd: path.join(dir, 'jxcore'),
      caption: 'Installing node modules for the sample...'
    });
  }

  commands.push({
    name: 'remove_dir',
    command: jxtools.fs.getRmdirCommand(www),
    caption: 'Removing previous www folder...'
  });

  commands.push({
    name: 'copy_sample',
    command: function () {
      jxtools.fs.copySync(dir, www);
    },
    caption: 'Copying sample folder...'
  });

  commands.push({
    name: 'cordova_prepare',
    command: 'cordova prepare',
    caption: 'Executing `cordova prepare` command...'
  });

  commands.push(function () {
    jxcore.utils.console.info('The project is using `' + sampleName + '` sample now.');
  });

  jxtools.fs.execMultiple(commands, function (ret) {
    if (ret.errors)
      jxcore.utils.console.error(ret.errors);
  });

};