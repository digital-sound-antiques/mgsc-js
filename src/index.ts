import { initModule, getModule } from "./module.js";
import { convert as utf16_to_sjis } from "utf16-to-sjis";
import * as EncodingDetect from "./encoding-detect.js";

function extractBanner(raw: string) {
  let m = raw.match(/^((.*\n)+?)\s*\n/);
  if (m != null) {
    return m[1];
  }
  return null;
}

function extractTrackInfo(raw: string) {
  let m = raw.match(/(track :.*\n)+.*\ntotal :.*\n/);
  if (m != null) {
    return m[0];
  }
  return null;
}

function extractErrorInfo(raw: string) {
  let m = raw.match(/\n(.*) in ([0-9]+)\n>> (.*)\n/);
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
 * Encoding label that can be accepted TextDecoder.
 */
export type TextDecoderEncoding = "utf-16le" | "utf-16be" | "utf-8" | "shift-jis" | "euc-jp" | "iso-2022-jp";

/**
 * Detect a text encoding from a given data stream.
 */
export function detectEncoding(data: ArrayLike<number>): TextDecoderEncoding | "ascii" | "binary" | null {
  if (EncodingDetect.isUTF16LE(data)) {
    return "utf-16le";
  }
  if (EncodingDetect.isUTF16BE(data)) {
    return "utf-16be";
  }
  if (EncodingDetect.isBINARY(data)) {
    return "binary";
  }
  if (EncodingDetect.isASCII(data)) {
    return "ascii";
  }
  if (EncodingDetect.isJIS(data)) {
    return "iso-2022-jp";
  }
  if (EncodingDetect.isUTF8(data)) {
    return "utf-8";
  }
  if (EncodingDetect.isEUCJP(data)) {
    return "euc-jp";
  }
  if (EncodingDetect.isSJIS(data)) {
    return "shift-jis";
  }
  return null;
}

/**
 * Parse string as encoding name for TextDecoder.
 */
export function toTextDecoderEncoding(text: string | null): TextDecoderEncoding | null {
  const normalized = text?.trim().toLowerCase().replace(/[\-_]/g, "");
  switch (normalized) {
    case "utf16":
      throw new Error(`${text} is ambiguous. Use utf-16le or utf-16be instead.`);
    case "utf16le":
      return "utf-16le";
    case "ucs2":
    case "utf16be":
      return "utf-16be";
    case "iso646":
    case "cp367":
    case "ascii":
    case "utf8":
      return "utf-8";
    case "iso2022jp":
    case "jis":
      return "iso-2022-jp";
    case "eucjp":
      return "euc-jp";
    case "sjis":
    case "shiftjis":
    case "cp932":
    case "ms932":
      return "shift-jis";
    default:
      return null;
  }
}

export type CompilerResult = {
  /** Compiled MGS binary. Its length is zero if the compiler fails. */
  mgs: Uint8Array;
  /** The status of this compile session. `true` if and only if there is no compilation errors. */
  success: boolean;
  /** The raw message from the compiler stdout. */
  rawMessage: string;
  /** The banner and copyright text of the compiler. */
  bannerText: string;
  /** The track status message that is corresponding to the -T option output of the original MGSC. */
  trackInfoText: string;
  /** Error information. `null` if no compilation errors */
  errorInfo: {
    message: string;
    lineNumber: number;
    lineText: string;
  } | null;
};

/**
 * Decode text from buffer.
 * @param input
 * @param encoding Specify encoding name. It is automatically detected if not specified.
 * @returns string decoded.
 */
export function decodeText(input: ArrayBuffer | ArrayBufferView, encoding?: string | null): string {
  if (encoding == null) {
    if (input instanceof ArrayBuffer) {
      encoding = detectEncoding(new Uint8Array(input));
    } else {
      encoding = detectEncoding(new Uint8Array(input.buffer, input.byteOffset, input.byteLength));
    }
  }

  if (encoding == "binary") {
    throw new Error("Input source is not a text.");
  }

  return new TextDecoder(toTextDecoderEncoding(encoding) ?? "utf-8").decode(input);
}

/**
 * MGSC emulator for JavaScript. MGSC is a MML compiler for MGSDRV on MSX.
 */
export class MGSC {
  /**
   * Initialize the library.
   * This function must be called with await before using other methods of MGSC.
   * @returns a Promise<void>
   */
  static async initialize() {
    await initModule();
  }

  /**
   * @param source MML text.
   * @example
   * import { MGSC } from "mgsc-js";
   * const result = MGSC.compile('#opll_mode 0\n#tempo 120\n9 v13@0o4cdefgab>c\n');
   */
  static compile(source: string): CompilerResult {
    /* remain at least a single space because empty header exists at the last line of mml */
    /* ex. `9\n<EOF>` is error but `9 \n<EOF>` is accepted by original MGSC.COM */
    const mml = source.replace(/\s+$/, " ") + "\n";
    const mmlbuf = utf16_to_sjis(mml);

    if (16384 * 3 < mmlbuf.length) {
      throw new Error("MML source is too long.");
    }
    const inp = getModule()._malloc(mmlbuf.length + 1);
    getModule().HEAPU8.set(mmlbuf, inp);
    getModule().HEAPU8[inp + mmlbuf.length] = 0;

    const ptr = getModule()._malloc(32768);
    const log = getModule()._malloc(32768);
    const size = getModule().ccall("MGSC_compile", "number", ["number", "number", "number"], [inp, ptr, log]);
    const mgs = new Uint8Array(size);
    mgs.set(new Uint8Array(getModule().HEAPU8.buffer, ptr, size));

    const message = getModule()
      .AsciiToString(log)
      .replace(/^\s*|\s*$/, "")
      .replace(/\r/g, "");

    getModule()._free(inp);
    getModule()._free(ptr);
    getModule()._free(log);

    return {
      mgs: mgs,
      success: 0 < mgs.length,
      errorInfo: extractErrorInfo(message),
      bannerText: extractBanner(message) ?? "",
      trackInfoText: extractTrackInfo(message) ?? "",
      rawMessage: message,
    };
  }

  static decodeText = decodeText;
}
