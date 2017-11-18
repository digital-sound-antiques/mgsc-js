(function(){
  'use strict'
  var Module = require('./mgsc_module');
  var Encoding = require('encoding-japanese');

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
        lineText: m[3],
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
  var MGSC = function() {};

  /**
   * @typedef CompilerResult
   * @prop {Uint8Array} mgs - The output MGS data. Its length is zero if the compiler fails.
   * @prop {boolean} success - `true` if and only if there is no compilation errors.
   * @prop {string} rawMessage - The raw output message of the compiler.
   * @prop {string} bannerText - The banner and copyright text of the compiler.
   * @prop {string} trackInfoText - The track memory usage corresponding to the -T option output of the original MGSC.)
   * @prop {Object} [errorInfo] - The error info. `null` if no compilation errors.
   * @prop {string} errorInfo.message - The error message.
   * @prop {number} errorInfo.lineNumber - The error line number.
   * @prop {string} errorInfo.lineText - The error line text.
   */

  /**
   * @param {string} mml - The input MML text. It must be a JavaScript string. i.e. UTF-16 encoded.
   * @returns {CompilerResult}
   * @static
   * @memberof MGSC
   * @example
   * var MGSC = require('mgsc-js');
   * var result = MGSC.compile('#opll_mode 0\n#tempo 120\n9 v13@0o4cdefgab>c\n');
   */
  MGSC.compile = function(source) {      

    var mml = source.replace(/\s*$/,'') + "\n";

    var mmlbuf = Encoding.convert(mml, { 
        to: 'SJIS', 
        type: 'arraybuffer',
    });

    if (16384 * 3 < mmlbuf.length) {
      throw new Error('MML source is too long.');
    }
    var inp = Module._malloc(mmlbuf.length+1);
    Module.HEAPU8.set(mmlbuf,inp,mmlbuf.length);
    Module.HEAPU8[inp+mmlbuf.length] = 0;

    var ptr = Module._malloc(32768);
    var log = Module._malloc(32768);
    var size = Module.ccall('MGSC_compile', 'number', ['number','number','number'], [inp,ptr,log]);
    var mgs = new Uint8Array(size);
    mgs.set(new Uint8Array(Module.HEAPU8.buffer,ptr,size));     
    var message = Module.AsciiToString(log).replace(/^\s*|\s*$/,'').replace(/\r/g,'');

    Module._free(inp);
    Module._free(ptr);
    Module._free(log);
    
    return { 
      mgs: mgs, 
      success: (0 < mgs.length),
      errorInfo: extractErrorInfo(message),
      bannerText: extractBanner(message),
      trackInfoText: extractTrackInfo(message),
      rawMessage: message,
    };
  };

  if (typeof exports === 'object') {
    module.exports = MGSC;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return MGSC;
    });
  }
}());
