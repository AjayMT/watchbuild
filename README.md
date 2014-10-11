
# watchbuild
[![Build Status](https://travis-ci.org/AjayMT/watchbuild.svg)](https://travis-ci.org/AjayMT/watchbuild)

watchbuild is a small tool that allows you to watch a set of files and update other files when the original files change.

Here's an example of a tool that automatically converts markdown to HTML, implemented with watchbuild and [marked](http://npmjs.org/marked):

```javascript
var marked = require('marked');
var wb = require('watchbuild');

wb('foo.md', 'bar.html', marked);
```

While this script is running, every time 'foo.md' changes, 'bar.html' will be updated automatically. This is useful for doing things like compiling LESS/Sass/Stylus/whatever files, compiling coffeescript and doing various other things.

## Installation

```sh
$ npm install --save watchbuild
```

## API
### watchbuild(inputFile, outputFile, transformingFunction)
`inputFile` is a file path or glob pattern that can match multiple files. These are the files watchbuild watches for changes.

`outputFile` is a file path or an object. This is the file watchbuild will update whenever it detects changes. When `inputFile` is a glob pattern that matches multiple files, it is often useful to pass in an object for `outputFile`. The object will map parts of input file paths to the paths of the corresponding output file paths. To illustrate this better, here is an example:

```javascript
var marked = require('marked');
var wb = require('watchbuild');

wb('*.md', {             // watch all markdown files in '.'
  'foo.md': 'foo.html',  // whenever foo.md changes, foo.html is updated
  'bar.md': 'bar.html'   // whenever bar.md changes, bar.html is updated
}, marked);
```

Note that 'foo.md' and 'bar.md' could be written as just 'foo' and 'bar' or any other part of a file path that uniquely identifies a file.

`transformingFunction` is a function that returns the contents of the output file.It is called with two arguments: the contents of the input file and the path of the input file.

This function returns an instance of [fs.FSWatcher](http://nodejs.org/api/fs.html#fs_class_fs_fswatcher).

## Logging
watchbuild uses [debug](http://npmjs.org/debug) for logging. To turn on logging:

```sh
$ export DEBUG="watchbuild"
```

## License
MIT License. See `./LICENSE` for more information.
