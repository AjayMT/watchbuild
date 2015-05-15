
# watchbuild
Watch files and transform them with streams.

```javascript
var wb = require('watchbuild');
var marked = require('marked');
var through = require('through2');

// convert 'test.md' to html and write the result to 'test.html'
// whenever 'test.md' it changes
wb({ './test.md': './test.html' }, marked);

// also supports streams
wb({ './foo.md': './foo.html' }, through(function (buf, _, next) {
  this.push(marked(buf.toString()));
  next();
}));

// and globs
wb({ './*bar.md': 'bar.html', './*foo.md': 'foo.html' }, marked);
```

## Installation
```sh
$ npm install watchbuild
```

## API
### watchbuild(files, transform)
`files` is an object mapping glob patterns to output paths.

`transform` can be a transform stream or a function that takes and returns a string.

## License
MIT. See `./LICENSE` for details.

## TODO
- more tests
