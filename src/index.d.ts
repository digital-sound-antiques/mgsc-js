type CompilerResult = {
  mgs: Uint8Array; // Compiled MGS binary. Its length is zero if the compiler fails.
  success: boolean; // `true` if and only if there is no compilation errors.
  rawMessage: string; // The raw message from the compiler stdout.
  bannerText: string; // The banner and copyright text of the compiler.
  trackInfoText: string; // The track memory usage corresponding to the -T option output of the original MGSC.
  errorInfo: { // The error info. `null` if no compilation errors
    message: string;
    lineNumber: number;
    lineText: string;
  } | null;
};

class MGSC {
  static initialize(): Promise<void>;
  static compile(source: string): CompilerResult;
}