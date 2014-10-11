
/* global require, module */

// require()s
var fs = require('fs');
var path = require('path');

var chokidar = require('chokidar');
var glob = require('glob');
var debug = require('debug')('watchbuild');

var watcher;

// watch: start watching all files that match glob pattern 'infile'
// 'outfiles' is an object mapping parts of names of input files
// to output file paths. 'cb' is called every time a file changes,
// with the file contents and file name as arguments. 'cb' should
// return the contents of the output file
function watch (infile, outfiles, cb) {
  var infiles = glob.sync(infile);

  for (var k in infiles) debug('watching file ' + infiles[k]);

  if (! watcher || watcher.closed) {
    watcher = chokidar.watch(infiles[0], { persistent: true });

    var otherfiles = infiles.slice(1);
    for (var f in otherfiles)
      watcher.add(otherfiles[f]);

    watcher.on('all', function (change, filename) {
      debug('building ' + filename);

      var outfile;

      if (typeof outfiles === 'object')
        for (var j in outfiles)
          if (filename.indexOf(j) !== -1)
            outfile = outfiles[j];

      if (! outfile)
        outfile = filename.split('.').slice(0, -1).join('.');

      fs.readFile(filename, { encoding: 'utf-8' }, function (err, data) {
        if (err) console.error(err);
        else {
          if (typeof outfiles === 'object')
            fs.writeFile(outfile, cb(data, filename), function (err) {
              if (err) console.error(err);
              else debug('wrote file ' + outfile);
            });
          else
            fs.writeFile(outfiles, cb(data, filename), function (err) {
              if (err) console.error(err);
              else debug('wrote file ' + outfiles);
            });
        }
      });
    });
  } else
    for (var l in infiles)
      watcher.add(infiles[l]);

  return watcher;
}

function group (inglobs, outfile, cb) {
  var infiles = [];
  var groupdata = {};

  for (var g in inglobs)
    infiles = infiles.concat(glob.sync(inglobs[g]));

  for (var k in infiles) debug('watching file ' + infiles[k]);

  if (! watcher || watcher.closed) {
    watcher = chokidar.watch(infiles[0], { persistent: true });

    for (var k in infiles)
      watcher.add(infiles[k]);

    watcher.on('all', function (change, filename) {
      debug('building ' + filename);

      fs.readFile(filename, { encoding: 'utf-8' }, function (err, data) {
        if (err) console.error(err);
        else {
          groupdata[filename] = data;
          var groupcontent = '';

          for (var d in groupdata) groupcontent += groupdata[d];

          fs.writeFile(outfile, cb(groupcontent, filename), function (err) {
            if (err) console.error(err);
            else debug('wrote file ' + outfile);
          });
        }
      });
    });
  }
  else
    for (var j in infiles)
      watcher.add(infiles[j]);

  return watcher;
}

module.exports = watch;
module.exports.group = group;
