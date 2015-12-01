// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var os = require('os');
var jxtools = require('jxtools');
var common = require('../common.js');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';

var help = common.getHelp('sample');
var jxPath = null;

exports.run = function (cb) {

  if (process.argv[2] !== 'sample')
    return;

  process.argv[2] = '--sample';
  var parsedArv = jxcore.utils.argv.parse({force: true});
  var val = parsedArv.sample.value;

  if (!val)
    return cb(null, help);

  if (parsedArv.list || val === 'list')
    return list(val, cb);

  var opts = {
    outputDir : common.homeDir,
    extraPaths : [ path.join(common.homeDir, process.platform === 'win32' ? 'jx.exe' : 'jx') ]
  };

  jxtools.findOrDownloadJXcore(opts , function(err, _jxPath) {
    if (err)
      cb(err);
    else {
      jxPath = _jxPath;
      exports.useSample(val, function(err) {
        if (err)
          jxcore.utils.console.error(err);
      });
    }
  });
};


exports.useSample = function (sampleName, cb) {

  if (path.basename(sampleName) !== sampleName)
    var dir = path.resolve(sampleName);

  if (!fs.existsSync(dir))
    dir = path.join(process.cwd(), 'plugins', dname, 'sample', sampleName);

  if (!fs.existsSync(dir))
    return cb('Wrong sample name: ' + sampleName);

  if (fs.existsSync(path.join(dir, 'www')))
    dir = path.join(dir, 'www');

  if (!fs.existsSync(path.join(dir, 'jxcore')))
    return cb('The expected folder www/jxcore was not found in ' +dir);

  var www = path.join(process.cwd(), "www");
  var backup_www = path.join(process.cwd(), "www_backup");
  var installsFromCwd = dir.indexOf(process.cwd()) !== -1;

  if (!installsFromCwd) {
    var _d = getPluginDir();
    if (_d.err)
      return cb(_d.err);
  }

  if (!fs.existsSync(backup_www)) {
    jxtools.fs.copySync(www, backup_www);
  }

  var commands = [];

  var package_json = path.join(dir, "jxcore/package.json");
  var node_modules = path.join(dir, "jxcore/node_modules");
  var node_modules_needed = false;

  if (fs.existsSync(package_json) && !fs.existsSync(node_modules)) {
    node_modules_needed = true;
    // install mode_modules only if local subdirectory
    if (installsFromCwd) {
      node_modules_needed = false;
      commands.push({
        name: "install modules",
        command: '"' + jxPath + '" install --autoremove ".*,*.md,*.MD,*.gz"',
        cwd: path.join(dir, 'jxcore'),
        caption: 'Installing npm modules for the sample...'
      });
    }
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

  if (node_modules_needed) {
    commands.push({
      name: "install modules",
      command: '"' + jxPath + '" install --autoremove ".*,*.md,*.MD,*.gz"',
      cwd: path.join(www, 'jxcore'),
      caption: 'Installing npm modules for the sample...'
    });
  }

  commands.push({
    name: 'cordova_prepare',
    command: 'cordova prepare',
    caption: 'Executing `cordova prepare` command...'
  });

  commands.push(function () {
    jxcore.utils.console.info('The project is using `' + sampleName + '` sample now.');
  });

  jxtools.fs.execMultiple(commands, function (ret) {
    cb(ret.errors);
  });

};

var list = function(sampleName, cb) {

  var dir = getPluginDir();
  if (dir.err)
    return cb(dir.err);

  var files = fs.readdirSync(dir);
  var ret = [];
  for(var o in files) {
    var d1 = path.join(dir, files[o], 'www/jxcore');
    var d2 = path.join(dir, files[o], 'jxcore');
    if (fs.existsSync(d1) || fs.existsSync(d2))
      ret.push(files[o]);
  }

  var str = '';
  var col = jxcore.utils.console.setColor;
  var sep = os.EOL + '  ';
  if (!ret.length)
    str = col('Samples not found.', 'magenta');
  else
    str = col('The following samples are available:', 'green') + sep + ret.join(sep);

  return cb(false, str);
};


var getPluginDir = function() {
  var dir = path.join(process.cwd(), 'plugins', dname, 'sample');
  return fs.existsSync(dir) ? dir : { err : 'The plugin folder does not exist. Is plugin ' + dname + ' installed?' };
};