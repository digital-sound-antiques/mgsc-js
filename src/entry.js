(function(){
  'use strict'
  var Module = require('./mgsc_module');

  var encoding = require('encoding-japanese');

  var MGSC = function() {};

  MGSC.compile = function(mml) {      
    mml = mml.replace(/\s*$/,'') + "\n";
    var mmlbuf = encoding.convert(mml,{from:'UNICODE',to:'SJIS',type:'arraybuffer'});
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
    var message = Module.AsciiToString(log).replace(/^\s*|\s*$/,'');

    Module._free(inp);
    Module._free(ptr);
    Module._free(log);
    
    return { mgs:mgs, message:message };
  };

  if (typeof exports === 'object') {
    module.exports = MGSC;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return MGSC;
    });
  }
}());
