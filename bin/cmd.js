#!/usr/bin/env node

const FS = require("fs");
const Path = require("path");
const MGSC = require("../src/entry");
const Encoding = require("encoding-japanese");

function printUsageAndExit(code) {
  console.log(
    "Usage: mgsc [options] source\n" +
      "\n" +
      "[options]\n" +
      "  -o, --output FILE   : Specify the output filename.\n" +
      "  -e, --encode ENCODE : Specify the input file encoding [default:AUTO].\n" +
      "                        Available encodings: UTF16, UTF16BE, UTF16LE, \n" +
      "                        JIS, UTF8, EUCJP, SJIS\n" +
      "  -t                  : Show track memory usage.\n" +
      "  -h, --help          : Show this help.\n"
  );
  process.exit(code);
}

var argv = require("minimist")(process.argv.slice(2), {
  string: ["output", "enc"],
  boolean: ["t"],
  alias: { o: "output", T: "t", e: "encode" },
  unknown: function(arg) {
    if (arg.charAt(0) !== "-") {
      return true;
    }
    if (arg === "-h" || arg === "--help") {
      printUsageAndExit(0);
    }
    printUsageAndExit(1);
  }
});

if (argv._.length == 0) {
  printUsageAndExit(0);
}

const input = argv._[0];
const name = Path.parse(input).name;
const isUpperCaseName = name.match(/^[A-Z0-9_\-]+$/) != null;
const ext = isUpperCaseName ? ".MGS" : ".mgs";
const output = argv.output || name + ext;
const buf = FS.readFileSync(input);

const source = Encoding.convert(buf, {
  from: (argv.encode || "AUTO").toUpperCase(),
  to: "UNICODE",
  type: "string"
});

const result = MGSC.compile(source);
console.log(result.bannerText);

if (!result.success) {
  console.log(result.errorInfo.message + " in " + result.errorInfo.lineNumber);
  console.log(">> " + result.errorInfo.lineText + "\n");
  process.exit(1);
}

console.log("Compile complete");
if (argv.t && result.trackInfoText != null) {
  console.log(result.trackInfoText);
}

FS.writeFileSync(output, new Buffer.from(result.mgs), "binary");
console.log("Save complete: " + output);
