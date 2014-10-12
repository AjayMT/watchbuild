
/* global require, describe, it, before, after */

var fs = require('fs');
var path = require('path');

var should = require('should');
var marked = require('marked');

describe('watching groups', function () {
  var wb = require('../watchbuild.js');
  var infiles = [path.join(__dirname, 'test-files', 'abc.md'),
                 path.join(__dirname, 'test-files', 'xyz.md')];
  var outfile = path.join(__dirname, 'abc.html');
  var watcher;

  before(function (done) {
    watcher = wb.group(infiles, outfile, function (data) {
      // this is to avoid marked being called with
      // other arguments
      return marked(data);
    });

    setTimeout(done, 100);
  });

  it('should build files', function () {
    var content = fs.readFileSync(outfile, { encoding: 'utf-8' });

    content.should.containEql('abc.md');
    content.should.containEql('xyz.md');
  });

  it('should respond to file changes', function (done) {
    var oldcontent = fs.readFileSync(infiles[0]);

    fs.writeFileSync(infiles[0], '`test`');

    setTimeout(function () {
      var content = fs.readFileSync(outfile, { encoding: 'utf-8' });

      content.should.containEql('<code>test</code>');
      fs.writeFileSync(infiles[0], oldcontent);

      done();
    }, 250);
  });

  after(function () {
    watcher.close();

    fs.unlinkSync(outfile);
  });
});
