
var fs = require('fs');
var path = require('path');
var wb = require('..');
var marked = require('marked');
var should = require('should');

describe('watchbuild', function () {
  this.timeout(5000);

  before(function (done) {
    var files = {};
    files[path.join(__dirname, '*.md')] = path.join(__dirname, 'test.html');

    wb(files, marked);

    setTimeout(done, 1000);
  });

  it('should build files when they change', function () {
    fs.readFileSync(path.join(__dirname, 'test.html'), { encoding: 'utf-8' })
    .should.containEql('<code>test</code>');
  });

  after(function () {
    fs.unlinkSync(path.join(__dirname, 'test.html'));
  });
});
