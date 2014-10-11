
/* global require, describe, it, before, after */

var path = require('path');
var fs = require('fs');

var should = require('should');
var marked = require('marked');
var glob = require('glob');

describe('watchbuild', function () {
  var wb = require('../watchbuild.js');
  var infiles = path.join(__dirname, '*.md');
  var outfiles = {
    foo: path.join(__dirname, 'out.html'),
    bar: path.join(__dirname, 'out2.html')
  };
  var watcher;

  before(function (done) {
    watcher = wb(infiles, outfiles, marked);

    setTimeout(done, 100);
  });

  it('should build files', function () {
    var contents = fs.readFileSync(outfiles.foo, { encoding: 'utf-8' });

    contents.should.containEql('<code>code</code>');
  });

  it('should respond to file changes', function (done) {
    var bar = path.join(__dirname, 'bar.md');
    var oldcontent = fs.readFileSync(bar);

    fs.writeFileSync(bar, '`code`');

    setTimeout(function () {
      var content = fs.readFileSync(outfiles.bar, { encoding: 'utf-8' });

      content.should.containEql('<code>code</code>');
      fs.writeFileSync(bar, oldcontent);

      done();
    }, 250);
  });

  it('should guess output file names', function () {
    var contents = fs.readFileSync(path.join(__dirname, 'baz'),
                                   { encoding: 'utf-8' });

    contents.should.containEql('<code>code</code>');
  });

  after(function () {
    for (var f in outfiles)
      fs.unlinkSync(outfiles[f]);

    infiles = glob.sync(infiles);
    for (var l in infiles) {
      var fname = infiles[l].split('.').slice(0, -1).join('.');

      if (fs.existsSync(fname))
        fs.unlinkSync(fname);
    }

    watcher.close();
  });
});
