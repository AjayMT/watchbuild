
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
### watchbuild(inputFile, outputFile[, options], transformingFunction)
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

`transformingFunction` is a function that returns the contents of the output file or a readable stream.It is called with two arguments: the contents of the input file and the path of the input file.

`options` is an optional argument documented below.

This function returns an instance of [fs.FSWatcher](http://nodejs.org/api/fs.html#fs_class_fs_fswatcher). Every time this function is called, it will not return a new FSWatcher instance; it uses only one instance of FSWatcher, so doing something like closing that watcher will close all file watching operations started with this function.

### watchbuild.group(inputFiles, outputFile[, options], transformingFunction)
This is similar to the regular `watchbuild` function, except that `watchbuild.group` watches a group of files (`inputFiles` is an array of glob patterns/file paths), and only writes to a single file (`outputFile` is simply a file path). `transformingFunction` is called with three arguments instead of two: the contents of all the files being watched, concatenated into a single string; the path of the file that changed; and an object mapping file paths to their contents.

This function is useful for making things like CSS preprocessor builders: multiple files can be watched and compiled into one single CSS file.

This function returns an instance of [fs.FSWatcher](http://nodejs.org/api/fs.html#fs_class_fs_fswatcher). Every time this function is called, it will not return a new FSWatcher instance; it uses only one instance of FSWatcher, so doing something like closing that watcher will close all file watching operations started with this function.

**Note: ** You *may* run into some issues when using `watchbuild.group` with a `transformingFunction` argument that returns a readable stream. I'm aware of this and working on it, and any help in the form of issues/pull requests is appreciated.

### options
The options argument is an object that is passed to [chokidar](http://npmjs.org/chokidar), the module watchbuild uses to watch files. These are some of the important options:

- **persistent** (boolean): Whether to keep the process running while files are buing watched. Defaults to true.
- **ignoreInitial** (boolean): Whether to ignore the initial 'add' events. Defaults to false.
- **ignored** (regexp or function): The files to be ignored. The regexp or function is tested against the whole path, not just the file name.
- **usePolling** (boolean): Whether to use fs.watchFile (uses polling) or fs.watch. Defaults to false on Windows, true Linux and OS X.

A full list of options can be found in [chokidar](http://npmjs.org/chokidar)'s documentation.

## Logging
watchbuild uses [debug](http://npmjs.org/debug) for logging. To turn on logging:

```sh
$ export DEBUG="watchbuild"
```

## License
MIT License. See `./LICENSE` for more information.
