
/* global require, module */

// require()s
var fs = require('fs');
var path = require('path');

var chokidar = require('chokidar');
var glob = require('glob');
var debug = require('debug')('watchbuild');

var watcher, groupWatcher;
var files = {}, groupFiles = {};

// getOutfile: given an object mapping parts of filenames to output
// file paths, find the output file path in object 'outfiles' which
// corresponds to filename 'filename'
function getOutfile (outfiles, filename) {
  var outfile;

  if (typeof outfiles === 'object')
    for (var j in outfiles)
      if (filename.indexOf(j) !== -1)
        outfile = outfiles[j];

  if (typeof outfiles === 'string') outfile = outfiles;

  if (! outfile)
    outfile = filename.split('.').slice(0, -1).join('.');

  return outfile;
}

// watch: start watching all files that match glob pattern 'infile'
// 'outfiles' is an object mapping parts of names of input files
// to output file paths. 'cb' is called every time a file changes,
// with the file contents and file name as arguments. 'cb' should
// return the contents of the output file
function watch (infile, outfiles, cb) {
  var infiles = glob.sync(infile);

  for (var k in infiles) {
    debug('watching file ' + infiles[k]);

    var filename = path.resolve('.', infiles[k]);

    files[filename] = {
      outfile: getOutfile(outfiles, filename),
      cb: cb
    };
  }

  if (! watcher || watcher.closed) {
    watcher = chokidar.watch(infiles[0], { persistent: true });

    var otherfiles = infiles.slice(1);
    for (var f in otherfiles)
      watcher.add(otherfiles[f]);

    watcher.on('all', function (change, filename) {
      debug('building ' + filename);

      filename = path.resolve('.', filename);

      fs.readFile(filename, { encoding: 'utf-8' }, function (err, data) {
        if (err) console.error(err);
        else {
          fs.writeFile(files[filename].outfile,
                       files[filename].cb(data, filename), function (err) {
                         if (err) console.error(err);
                         else debug('wrote file ' + files[filename].outfile);
                       });
        }
      });
    });
  } else
    for (var l in infiles)
      watcher.add(infiles[l]);

  return watcher;
}

// group: watch a group of files. Every time the content of
// any one of the files changes, 'outfile' is updated. 'cb'
// is called with three arguments: the concatenated
// content of all files in the group, the path of the file that
// changed, and an object mapping file paths to file contents
function group (inglobs, outfile, cb) {
  var infiles = [];
  var groupdata = {};

  for (var g in inglobs)
    infiles = infiles.concat(glob.sync(inglobs[g]));

  for (var k in infiles) {
    debug('watching file ' + infiles[k]);

    var filename = path.resolve('.', infiles[k]);

    groupFiles[filename] = {
      outfile: outfile,
      cb: cb
    };
  }

  if (! groupWatcher || groupWatcher.closed) {
    groupWatcher = chokidar.watch(infiles[0], { persistent: true });

    for (var k in infiles)
      groupWatcher.add(infiles[k]);

    groupWatcher.on('all', function (change, filename) {
      debug('building ' + filename);

      filename = path.resolve('.', filename);

      fs.readFile(filename, { encoding: 'utf-8' }, function (err, data) {
        if (err) console.error(err);
        else {
          groupdata[filename] = data;
          var groupcontent = '';
          var grpdatacopy = {};

          for (var d in groupdata) {
            groupcontent += groupdata[d];
            grpdatacopy[d] = groupdata[d];
          }

          fs.writeFile(groupFiles[filename].outfile,
                       groupFiles[filename].cb(groupcontent,
                                               filename, grpdatacopy),
                       function (err) {
                         if (err) console.error(err);
                         else
                           debug('wrote file ' + groupFiles[filename].outfile);
                       });
        }
      });
    });
  }
  else
    for (var j in infiles)
      groupWatcher.add(infiles[j]);

  return groupWatcher;
}

module.exports = watch;
module.exports.group = group;
