import moduleFactory from '../lib/libmgsc.js';

interface MgscModule extends EmscriptenModule {
  ccall: typeof ccall;
  cwrap: typeof cwrap;
  AsciiToString: (ptr: number) => string;
}

let _module: MgscModule | null;

export async function initModule(): Promise<void> {
  _module = await moduleFactory() as MgscModule;
}

export function getModule(): MgscModule {
  if (_module == null) {
    throw new Error("libkss module is not initialized.");
  }
  return _module;
}
