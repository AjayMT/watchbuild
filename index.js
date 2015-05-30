
/* global module, require */

var fs = require('fs');
var chokidar = require('chokidar');
var through = require('through2');
var minimatch = require('minimatch');

function wb (files, stream) {
  stream = stream();

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

    fs.createReadStream(fp).pipe(stream);

    if (outfile !== undefined && outfile !== null)
      stream.pipe(fs.createWriteStream(outfile));
  });

  return stream;
}

module.exports = wb;
