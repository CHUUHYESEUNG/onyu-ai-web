// Force Next.js to treat the runtime as a WebContainer-like environment
// so that it loads the WASM build of SWC instead of the native binary.
process.versions.webcontainer = '1';
process.env.NEXT_FORCE_WASM_ONLY = '1';
