# mgsc-js [![npm version](https://badge.fury.io/js/mgsc-js.svg)](https://badge.fury.io/js/mgsc-js)
<img src="https://nodei.co/npm/mgsc-js.png?downloads=true&stars=true" alt=""/>

[mgsc-js] is a JavaScript version of [MGSC] (MML to MGS compiler for [MGSDRV]) build with [Emscripten]

[mgsc-js]: https://github.com/digital-sound-antiques/mgsc-js
[MGSC]: https://github.com/digital-sound-antiques/mgsc
[MGSDRV]: http://www.gigamix.jp/mgsdrv/
[Emscripten]: https://github.com/kripken/emscripten

Repository: [mgsc-js GitHub](https://github.com/digital-sound-antiques/mgsc-js)

# Install as Command-Line Tool
```sh
$ npm install -g mgsc-js
```

# How to Use Command
```sh
$ mgsc-js [options] source
```
where the `source` is MGSC's MML source text.

## Options
```sh
$ mgsc-js
Usage: mgsc [options] source
[options]
  -o, --output FILE   : Specify the output filename.
  -e, --encode ENCODE : Specify the input file encoding [default:AUTO].
                        Available encodings: UTF16, UTF16BE, UTF16LE, 
                        JIS, UTF8, EUCJP, SJIS
  -t                  : Show track memory usage.
  -h, --help          : Show this help.
```

# Install and Use as Library
Install the mgsc-js as a node_module.

```sh
$ npm install --save mgsc-js
```

Then,

```javascript
const FS = require('fs');
const MGSC = require('mgsc-js');

MGSC.initialize().then(() => {
  const result = MGSC.compile('#opll_mode 0\n#tempo 120\n9 v13@0o4cdefgab>c\n');    
  if (!result.success) {
    console.log(result.errorInfo.message + ' in ' + result.errorInfo.lineNumber);
    console.log('>> ' + result.errorInfo.lineText + '\n');
    process.exit(1);
  }

  FS.writeFileSync('result.mgs', new Buffer(result.mgs), "binary");
});
```

# How to build Project
`emscripten >=3.0.0` and `cmake >=3.0` are required.

```sh
$ emcc -v # confirm emcc is on path and version >= 3.0.0
...
$ git clone --recursive https://github.com/digital-sound-antiques/mgsc-js.git
$ cd mgsc-js
$ npm install
$ npm run build 
$ npm run jsdoc # for document
```

# API Document
http://digital-sound-antiques.github.io/mgsc-js/
