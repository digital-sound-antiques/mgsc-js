module.exports = (function(){
	"use strict"
	var Module = require('exports?Module!../build/libmgsc');
	return {
		compile:function(mml) {
			var ptr = Module._malloc(32768);
			var log = Module._malloc(32768);
			var size = Module.ccall('MGSC_compile', 'number', ['string','number'], [mml,ptr,log]);
			var mgs = new Uint8Array(size);
			mgs.set(new Uint8Array(Module.HEAPU8.buffer,ptr,size));
			Module._free(ptr);
			Module._free(log);
			return { mgs:mgs, log:AsciiToString(log) };
		}
	};
}());

