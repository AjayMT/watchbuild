
/* global require, describe, it, before, after */

var path = require('path');
var fs = require('fs');
var stream = require('stream');

var should = require('should');
var spawn = require('child_process').spawn;
var marked = path.join(__dirname, '..', 'node_modules', '.bin', 'marked');

var wb = require('../watchbuild.js');

describe('returning streams for paths', function () {
  var infile = path.join(__dirname, 'test-files', 'baz.md');
  var outfile = path.join(__dirname, 'baz.html');
  var watcher;

  before(function (done) {
    watcher = wb(infile, outfile, function (data) {
      var m = spawn(marked);

      m.stdin.write(data);
      m.stdin.end();

      return m.stdout;
    });

    setTimeout(done, 200);
  });

  it('should build files', function () {
    var contents = fs.readFileSync(outfile, { encoding: 'utf-8' });

    contents.should.containEql('<code>code</code>');
  });

  it('should respond to file changes', function (done) {
    var oldcontent = fs.readFileSync(infile);

    fs.writeFileSync(infile, '`test`');

    setTimeout(function () {
      var content = fs.readFileSync(outfile, { encoding: 'utf-8' });

      content.should.containEql('<code>test</code>');
      fs.writeFileSync(infile, oldcontent);

      done();
    }, 500);
  });

  after(function (done) {
    watcher.close();

    fs.unlink(outfile, done);
  });
});

describe.skip('returning streams for groups', function () {
  var infiles = [path.join(__dirname, 'test-files', 'abc.md'),
                 path.join(__dirname, 'test-files', 'xyz.md')];
  var outfile = path.join(__dirname, 'abc.html');
  var watcher;

  before(function (done) {
    watcher = wb.group(infiles, outfile, function (data) {
      var m = spawn(marked);

      m.stdin.write(data);
      m.stdin.end();

      return m.stdout;
    });

    setTimeout(done, 500);
  });

  it('should build files', function () {
    var contents = fs.readFileSync(outfile, { encoding: 'utf-8' });

    contents.should.containEql('abc.md');
    contents.should.containEql('xyz.md');
  });

  after(function (done) {
    watcher.close();

    fs.unlink(outfile, done);
  });
});
