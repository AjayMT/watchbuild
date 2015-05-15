
/* global module, require */

var fs = require('fs');
var chokidar = require('chokidar');
var through = require('through2');
var minimatch = require('minimatch');

function wb (files, stream) {
  if (typeof stream === 'function') {
    var fn = stream;

    stream = through(function (buf, _, next) {
      this.push(fn(buf.toString()));

      next();
    });
  }

  chokidar.watch(Object.keys(files))
  .on('all', function (event, fp) {
    if (! (event === 'add' || event === 'change')) return;

    var outfile = files[fp];

    for (var k in files)
      if (minimatch(fp, k))
        outfile = files[k];

    fs.createReadStream(fp)
    .pipe(stream)
    .pipe(fs.createWriteStream(outfile));
  });
}

module.exports = wb;
