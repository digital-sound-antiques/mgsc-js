(function () {
  "use strict";
  const moduleFactory = require("../lib/libmgsc");
  const Encoding = require("encoding-japanese");
  
  let _emscriptenModulePromise = null;
  let _emscriptenModule = null;

  function getModule() {
    if (_emscriptenModule == null) {
      throw new Error('mgsc-js is not initialized.');
    }
    return _emscriptenModule;
  }

  function extractBanner(raw) {
    var m = raw.match(/^((.*\n)+?)\s*\n/);
    if (m != null) {
      return m[1];
    }
    return null;
  }

  function extractTrackInfo(raw) {
    var m = raw.match(/(track :.*\n)+.*\ntotal :.*\n/);
    if (m != null) {
      return m[0];
    }
    return null;
  }

  function extractErrorInfo(raw) {
    var m = raw.match(/\n(.*) in ([0-9]+)\n>> (.*)\n/);
    if (m != null) {
      return {
        message: m[1],
        lineNumber: Number(m[2]) + 1,
        lineText: m[3]
      };
    }
    return null;
  }

  /**
   * A MGSC emulator for JavaScript. MGSC is a MML compiler for MGSDRV on MSX.
   *
   * @name MGSC
   * @class
   */
  class MGSC {
    /**
     * Initialize the library.
     * This function must be called with await before using other methods of MGSC. 
     * @returns a Promise<void>
     */
    static async initialize() {
      if (_emscriptenModulePromise == null) {
        _emscriptenModulePromise = moduleFactory().then((m) => {
          _emscriptenModule = m;
        }).catch((reason) => {
          console.error(reason);
          _emscriptenModulePromise = null;
        });
      }
      return _emscriptenModulePromise;
    }
    /**
     * @typedef CompilerResult
     * @prop {Uint8Array} mgs - Compiled MGS binary. Its length is zero if the compiler fails.
     * @prop {boolean} success - `true` if and only if there is no compilation errors.
     * @prop {string} rawMessage - The raw output message of the compiler.
     * @prop {string} bannerText - The banner and copyright text of the compiler.
     * @prop {string} trackInfoText - The track memory usage corresponding to the -T option output of the original MGSC.
     * @prop {Object} [errorInfo] - The error info. `null` if no compilation errors.
     * @prop {string} errorInfo.message - The error message.
     * @prop {number} errorInfo.lineNumber - The error line number.
     * @prop {string} errorInfo.lineText - The error line text.
     */
    /**
     * @param {string} source - The input MML text. It must be a JavaScript string. i.e. UTF-16 encoded.
     * @returns {CompilerResult}
     * @static
     * @memberof MGSC
     * @example
     * var MGSC = require('mgsc-js');
     * var result = MGSC.compile('#opll_mode 0\n#tempo 120\n9 v13@0o4cdefgab>c\n');
     */
    static compile(source) {
      /* remain at least a single space because empty header exists at the last line of mml */
      /* ex. `9\n<EOF>` is error but `9 \n<EOF>` is accepted by original MGSC.COM */
      var mml = source.replace(/\s+$/, " ") + "\n";

      var mmlbuf = Encoding.convert(mml, {
        to: "SJIS",
        type: "arraybuffer"
      });

      if (16384 * 3 < mmlbuf.length) {
        throw new Error("MML source is too long.");
      }
      var inp = getModule()._malloc(mmlbuf.length + 1);
      getModule().HEAPU8.set(mmlbuf, inp, mmlbuf.length);
      getModule().HEAPU8[inp + mmlbuf.length] = 0;

      var ptr = getModule()._malloc(32768);
      var log = getModule()._malloc(32768);
      var size = getModule().ccall("MGSC_compile", "number", ["number", "number", "number"], [inp, ptr, log]);
      var mgs = new Uint8Array(size);
      mgs.set(new Uint8Array(getModule().HEAPU8.buffer, ptr, size));
      var message = getModule().AsciiToString(log)
        .replace(/^\s*|\s*$/, "")
        .replace(/\r/g, "");

      getModule()._free(inp);
      getModule()._free(ptr);
      getModule()._free(log);

      return {
        mgs: mgs,
        success: 0 < mgs.length,
        errorInfo: extractErrorInfo(message),
        bannerText: extractBanner(message),
        trackInfoText: extractTrackInfo(message),
        rawMessage: message
      };
    }
  }


  if (typeof exports === "object") {
    module.exports = MGSC;
  } else if (typeof define === "function" && define.amd) {
    define(function () {
      return MGSC;
    });
  }
})();
