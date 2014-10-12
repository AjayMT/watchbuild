
/* global require, describe, it, after, before */

var path = require('path');
var fs = require('fs');

var should = require('should');
var marked = require('marked');

describe('watching multiple files', function () {
  var wb = require('../watchbuild.js');
  var infiles = [path.join(__dirname, 'test-files', 'foo.md'),
                 path.join(__dirname, 'test-files', 'bar.md')];
  var outfiles = [path.join(__dirname, 'foo.html'),
                  path.join(__dirname, 'bar.html')];
  var watcher;

  before(function (done) {
    wb(infiles[0], outfiles[0], marked);
    watcher = wb(infiles[1], outfiles[1], marked);

    setTimeout(done, 100);
  });

  it('should build files', function () {
    var foo = fs.readFileSync(outfiles[0], { encoding: 'utf-8' });
    var bar = fs.readFileSync(outfiles[1], { encoding: 'utf-8' });

    foo.should.containEql('<code>code</code>');
  });

  after(function () {
    watcher.close();

    for (var f in outfiles) fs.unlinkSync(outfiles[f]);
  });
});
