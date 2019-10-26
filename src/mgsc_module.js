(function() {
  "use strict";
  var m = require("../lib/libmgsc")();
  if (typeof exports === "object") {
    module.exports = m;
  } else if (typeof define === "function" && define.amd) {
    define(function() {
      return m;
    });
  }
})();
