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

  exports.useSample(val, cb);
};


exports.useSample = function(sampleName, cb) {

  var opts = {
    outputDir : common.homeDir,
    extraPaths : [ path.join(common.homeDir, process.platform === 'win32' ? 'jx.exe' : 'jx') ]
  };

  jxtools.findOrDownloadJXcore(opts , function(err, _jxPath) {
    if (err)
      cb(err);
    else {
      jxPath = _jxPath;
      _useSample(sampleName, cb);
    }
  });
};


var _useSample = function (sampleName, cb) {

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

  var project_dir = process.cwd();

  // Read installed plugins
  var installed_plugins;
  var plugins_json = path.join(project_dir, 'plugins/fetch.json');
  if (fs.existsSync(plugins_json)) {
    installed_plugins = Object.keys(require(plugins_json));
  } else {
    installed_plugins = [];
  }

  // Read installed platforms
  var installed_platforms;
  var platforms_json = path.join(project_dir, 'platforms/platforms.json');
  if (fs.existsSync(platforms_json)) {
    installed_platforms = Object.keys(require(platforms_json));
  } else {
    installed_platforms = [];
  }

  // Unused plugins (all plugins except io.jxcore.node and whitelist)
  var unused_plugins = installed_plugins.filter(function (plugin_name) {
    return plugin_name !== dname && plugin_name !== 'cordova-plugin-whitelist';
  });

  // Unused platforms
  var unused_platforms = installed_platforms.slice();

  /* Install platforms add plugins from sample's `package.json`
    "jxc": {
      "plugins": [<plugin_name>],
      "platforms": [<platform_name>]
    }
  */
  var sample_package_json = path.resolve(dir, '../package.json');
  if (fs.existsSync(sample_package_json)) {
    var package_json_data = require(sample_package_json);
    if (package_json_data.jxc) {
      var jxc_data = package_json_data.jxc;

      if (jxc_data.plugins) {
        if (jxc_data.plugins.length) {
          // Set unused plugins
          unused_plugins.filter(function (unused_plugin) {
            return jxc_data.plugins.indexOf(unused_plugin) !== -1;
          }).forEach(function (used_plugin) {
            unused_plugins.splice(unused_plugins.indexOf(used_plugin), 1)
          });

          // Install plugins
          Array.prototype.push.apply(commands,
            // Skip installed plugins
            jxc_data.plugins.filter(function (plugin_name) {
              return installed_plugins.indexOf(plugin_name) === -1;
            })
            .map(function (plugin_name) {
              return {
                name: 'install plugins',
                command: 'cordova plugins add ' + plugin_name,
                caption: 'Installing ' + plugin_name + ' plugin...'
              };
            })
          );
        }

        // Delete unused plugins
        unused_plugins.forEach(function (unused_plugin) {
          commands.push({
            name: 'remove unused plugin',
            command: 'cordova plugins remove ' + unused_plugin,
            caption: 'Removing unused plugin ' + unused_plugin + '...'
          });
        });
      }
      
      if (jxc_data.platforms) {
        if (!jxc_data.platforms.length) {
          throw 'Platforms can not be empty. Please add at least one platform in package.json\'s jxc.platforms property';
        }

        // Set unused platforms
        unused_platforms.filter(function (unused_platform) {
          return jxc_data.platforms.indexOf(unused_platform) !== -1;
        }).forEach(function (used_platform) {
          unused_platforms.splice(unused_platforms.indexOf(used_platform), 1)
        });

        // Install platforms
        Array.prototype.push.apply(commands,
          // Skip installed platforms
          jxc_data.platforms.filter(function (platform_name) {
            return installed_platforms.indexOf(platform_name) === -1;
          })
          .map(function (platform_name) {
            return {
              name: 'install platforms',
              command: 'cordova platforms add ' + platform_name,
              caption: 'Installing ' + platform_name + ' platform...'
            };
          })
        );

        // Delete unused platforms
        unused_platforms.forEach(function (unused_platform) {
          commands.push({
            name: 'remove unused platform',
            command: 'cordova platforms remove ' + unused_platform,
            caption: 'Removing unused platform ' + unused_platform + '...'
          });
        });
      }
    }
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