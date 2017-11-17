# mgsc-js

mgsc-js is a Javascript version of [MGSC](https://github.com/digital-sound-antiques/mgsc) (MML to MGS compiler) build with [Emscripten](https://github.com/kripken/emscripten).

# How to Install

```
npm install -g mgsc-js
```

# How to Use
```
mgsc-js filename [-o output]
```
where the `filename` is MGSC's MML source text.

- If `-o` option is surpressed, the command generates `[filename].mgs`.

# How to checkout & build

Prerequesties: node.js, `cmake` and `emcmake` are required to build the project.

```
git clone --recursive https://github.com/digital-sound-antiques/mgsc-js.git
cd mgsc-js
npm install
npm run build
```

