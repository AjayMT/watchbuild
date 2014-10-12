
/* global require, describe, it, before, after */

var fs = require('fs');
var path = require('path');

var should = require('should');
var marked = require('marked');

describe('watching paths', function () {
  var wb = require('../watchbuild.js');
  var infile = path.join(__dirname, 'test-files', 'foo.md');
  var outfile = path.join(__dirname, 'foo.html');
  var watcher;

  before(function (done) {
    watcher = wb(infile, outfile, marked);

    setTimeout(done, 100);
  });

  it('should build files', function () {
    var content = fs.readFileSync(outfile, { encoding: 'utf-8' });

    content.should.containEql('<code>code</code>');
  });

  it('should respond to file changes', function (done) {
    var oldcontent = fs.readFileSync(infile);

    fs.writeFileSync(infile, '`test`');

    setTimeout(function () {
      var content = fs.readFileSync(outfile, { encoding: 'utf-8' });

      content.should.containEql('<code>test</code>');
      fs.writeFileSync(infile, oldcontent);

      done();
    }, 250);
  });

  after(function () {
    watcher.close();

    fs.unlinkSync(outfile);
  });
});
