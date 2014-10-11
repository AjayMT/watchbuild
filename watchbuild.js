
/* global require, module */

// require()s
var fs = require('fs');
var path = require('path');

var chokidar = require('chokidar');
var glob = require('glob');
var debug = require('debug')('watchbuild');

// watch: start watching all files that match glob pattern 'infile'
// 'outfiles' is an object mapping parts of names of input files
// to output file paths. 'cb' is called every time a file changes,
// with the file contents and file name as arguments. 'cb' should
// return the contents of the output file
function watch (infile, outfiles, cb) {
  var watcher;
  var infiles = glob.sync(infile);

  for (var k in infiles) debug('watching file ' + infiles[k]);

  if (! watcher) {
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
            fs.writeFile(outfile, cb(data, filename), function () {
              debug('wrote file ' + outfile);
            });
          else
            fs.writeFile(outfiles, cb(data, filename), function () {
              debug('wrote file ' + outfiles);
            });
        }
      });
    });
  } else
    for (var l in infiles)
      watcher.add(infiles[l]);

  return watcher;
}

module.exports = watch;
