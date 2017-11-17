#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mgsc = require('../src/entry');

function printUsageAndExit(code) {
	console.log(
		'Usage: mgsc [options] mmlfile\n' + 
		'\n' +
		'  -o, --output FILE : Specify output filename.\n' +
		'  -t                : Show the original mgsc message.\n' +
		'  -h                : Print this help.\n');
	process.exit(code);
}

var argv = require('minimist')(process.argv.slice(2), {
	string:['output'],
	boolean:['t'],
	alias:{'o':'output', 'T':'t'},
	unknown:function(arg) {	
		if (arg.charAt(0) !== '-') {
			return true;
		}
		if (arg === '-h' || arg === '--help') {
			printUsageAndExit(0);
		}
		printUsageAndExit(1);
	}
});

if (argv._.length == 0) {
	printUsageAndExit(0);
}

var input = argv._[0];
var output = argv.output || "./" + path.parse(input).name + ".mgs";

var mml = fs.readFileSync(input, 'utf-8');
var result = mgsc.compile(mml);

if (argv.t) {
  console.log(result.message);
}

fs.writeFileSync(output, new Buffer(result.mgs), "binary", function(err){
	console.log(err);
});