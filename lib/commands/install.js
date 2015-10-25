// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';
var common = require('../common.js');
var config = require('./config.js');

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
      }
    }
  });
};


var download = function (version, cb) {

  //var url = 'https://raw.githubusercontent.com/jxcore/jxcore-cordova-release/master/' + version + '/' + fname;
  var url = 'http://jxcordova.cloudapp.net/' + version + '/' + fname;
  var download = jxtools.http.download(url, fname, {attempts: 3, timeout: 10000});
  download.on('end', function (err) {
    if (!err)
      unpack(cb);
  });
};


var install = function(version, cb) {

  var offFile = checkOfflinePackage(version);
  var copied = false;
  if (offFile) {
    try {
      fs.writeFileSync(localFile, fs.readFileSync(offFile));
      copied = true;
    } catch (ex) {
      jxcore.utils.console.warn('Cannot use offline file: ' + ex);
    }

    if (copied) {
      jxtools.console.logPair('Using offline file:', offFile);
      return unpack(cb);
    }
  }

  // downloading if offline file is not used
  download(version, cb);
};



var checkOfflinePackage = function(version) {
  var cfg = config.read();
  if (cfg.err)
    return false;

  var offDir = cfg['offline-dir'];
  var offFile = path.join(offDir, version, fname);
  return fs.existsSync(offFile) ? offFile : false;
};

var getLatestCordovaVersion = function (cb) {

  var _url = 'https://raw.githubusercontent.com/jxcore/jxcore-cordova/master/package.json';
  jxtools.http.downloadString(_url, {silent: true}, function (err, json_str) {
    if (!err) {
      var version = 'unknown';
      try {
        var json = JSON.parse(json_str);
        version = json.version;
      } catch (ex) {
        return cb("Cannot parse package.json: " + ex);
      }

      cb(false, version);
    } else {
      cb(err);
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

  var plugin_installed_folder = path.join(process.cwd(), 'plugins', dname);
  if (fs.existsSync(plugin_installed_folder) && !parsedArgv.force) {
    jxcore.utils.console.warn('Skipping the installation, since plugin is already added.');
    jxcore.utils.console.log('If you want to force installing, use --force option or remove the plugin:');
    jxcore.utils.console.log('    > cordova plugins remove ' + dname);
    return;
  }

  var argv3 = process.argv[3];
  if (argv3 && argv3.slice(0, 1) === '-')
    argv3 = null;


  if (argv3) {
    install(argv3, cb);
  } else {
    getLatestCordovaVersion(function(err, version) {
      if (err)
        jxcore.utils.console.error(err);
      else {
        jxtools.console.logPair('Latest jxcore-cordova version:', version);
        install(version, cb);
      }
    });
  }

};

