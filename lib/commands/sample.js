// Copyright & License details are available under JXCORE_LICENSE file

var fs = require('fs');
var path = require('path');
var jxtools = require('jxtools');
var fname = 'io.jxcore.node.jx';
var dname = 'io.jxcore.node';


exports.run = function () {

  process.argv[2] = '--sample';
  var parsedArv = jxcore.utils.argv.parse({force: true});

  var sampleName = parsedArv.sample.value;
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

  jxtools.fs.rmdirSync(www);
  console.log("copying", dir, "into", www);
  jxtools.fs.copySync(dir, www);

  jxcore.utils.cmdSync('cordova prepare');

};