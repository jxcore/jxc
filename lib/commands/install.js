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


var writeToCache = function(version) {
  // for now supports only default path commmon.cacheDir

  var dir = path.join(common.cacheDir, version);
  var file = path.join(dir, fname);

  if (!fs.existsSync(common.cacheDir))
      fs.mkdirSync(common.cacheDir);

  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  fs.writeFileSync(file, fs.readFileSync(localFile));
};

var unpack = function (version, cb) {

  var commands = [];

  var cfg = config.read();
  var _writeToCache = !cfg.err && cfg.cache === true;

  if (_writeToCache && version) {
    commands.push({
      name: 'write_to_cache',
      command: function() {
        writeToCache(version);
      },
      caption: 'Saving file to cache...',
      skip_error: true
    });
  }

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

  var extract = {
    name: 'extract',
    command: '"' + process.execPath + '" ' + fname,
    caption: 'Extracting plugin package...'
  };

  if (cfg.cache)
    extract.postErrorMessage = 'If you see this error too often, you may try to add --force-download option.';

  // extract package
  commands.push(extract);

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
      unpack(version, cb);
  });
};


var install = function(version, cb) {

  var parsedArgv = jxcore.utils.argv.parse();

  var offFile = checkCachedPackage(version);
  var copied = false;
  if (offFile && !parsedArgv['force-download']) {
    try {
      fs.writeFileSync(localFile, fs.readFileSync(offFile));
      copied = true;
    } catch (ex) {
      jxcore.utils.console.warn('Cannot use cached file: ' + ex);
    }

    if (copied) {
      jxtools.console.logPair('Using cached file:', offFile);
      return unpack(null, cb);
    }
  }

  // downloading if cache file is not used
  download(version, cb);
};



var checkCachedPackage = function(version) {
  var cfg = config.read();
  if (cfg.err)
    return false;
  if (!cfg.cache)
    return false;
  var cacheDir = null;
  if (cfg.cache === true)
    cacheDir = common.cacheDir;
  else {
    if (cfg.cache.readonly && cfg.cache.path && fs.existsSync(cfg.cache.path))
      cacheDir = cfg.cache.path;
  }

  if (!cacheDir)
    return false;

  var cacheFile = path.join(cacheDir, version, fname);
  return fs.existsSync(cacheFile) ? cacheFile : false;
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

  var force = parsedArgv.force || parsedArgv['force-download'];

  if (fs.existsSync(localFile) && !force) {
    jxcore.utils.console.warn('Skipping the download, since file', fname, 'already exists.');
    jxcore.utils.console.log('If you want to force downloading, use --force option.');
    unpack(null, cb);
    return;
  }

  if (fs.existsSync(folder) && !force) {
    jxcore.utils.console.warn('Skipping the installation, since folder', dname, 'already exists.');
    jxcore.utils.console.log('If you want to force installing, use --force option.');
    return;
  }

  var plugin_installed_folder = path.join(process.cwd(), 'plugins', dname);
  if (fs.existsSync(plugin_installed_folder) && !force) {
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

