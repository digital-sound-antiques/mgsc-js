import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import fs from "fs";
import path from "path";
import { MGSC } from "./index.js";

const optionDefinitions = [
  {
    name: "output",
    alias: "o",
    typeLabel: "{underline file}",
    description: "Specify an output file. By default, the basename of input file is used with `.mml` extension.",
    type: String,
  },
  {
    name: "input",
    alias: "i",
    typeLabel: "{underline file}",
    defaultOption: true,
    description: "Specify an input MML text file.",
  },
  {
    name: "encoding",
    alias: "e",
    typeLabel: "{underline encoding}",
    description: "Specify an text encoding format of the input file.",
    type: String,
  },
  {
    name: "track-status",
    alias: "t",
    description: "Show a track status report after compile.",
    type: Boolean,
  },
  {
    name: "version",
    alias: "v",
    description: "Print version.",
    type: Boolean,
  },
  {
    name: "help",
    alias: "h",
    description: "Show this help.",
    type: Boolean,
  },
];

const sections = [
  {
    header: "mgsc-js",
    content: "MML Compiler for MGSDRV data object.",
  },
  {
    header: "SYNOPSIS",
    content: ["{underline mgsc-js} [<option>] <mmlfile>"],
  },
  {
    header: "OPTIONS",
    optionList: optionDefinitions,
  },
];

export async function main(argv: string[]) {
  let options: commandLineArgs.CommandLineOptions;
  try {
    options = commandLineArgs(optionDefinitions, { argv });
  } catch (e) {
    console.info((e as any)?.message);
    process.exit(1);
  }

  await MGSC.initialize();

  if (options.version) {
    const json = require("../package.json");
    console.info(json.version);
    return;
  }

  if (options.help || options.input == null) {
    console.info(commandLineUsage(sections));
    return;
  }

  try {
    const input = options.input;
    const name = path.parse(input).name;
    const isUpperCaseName = name.match(/^[A-Z0-9_\-]+$/) != null;
    const ext = isUpperCaseName ? ".MGS" : ".mgs";
    const output = options.output || name + ext;

    const buf = fs.readFileSync(input);

    const source = MGSC.decodeText(buf, options.encoding);
    const result = MGSC.compile(source);
    console.log(result.bannerText);

    if (!result.success) {
      console.log(result.errorInfo?.message + " in " + result.errorInfo?.lineNumber);
      console.log(">> " + result.errorInfo?.lineText + "\n");
      process.exit(1);
    }

    console.log("Compile complete");
    if (options["track-status"] && result.trackInfoText != null) {
      console.log(result.trackInfoText);
    }
    
    fs.writeFileSync(output, Buffer.from(result.mgs), "binary");
    console.log("Save complete: " + output);

  } catch (e) {    
    console.error((e as any)?.message);
    process.exit(1);
  }
}
