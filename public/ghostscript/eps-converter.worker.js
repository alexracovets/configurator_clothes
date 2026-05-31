import loadWASM from './gs.js';

const MAX_LOGO_PX = 1024;
const GS_DPI = 150;

/** @type {Promise<import('@types/emscripten').EmscriptenModule> | null} */
let modulePromise = null;

const ensureModule = () => {
  if (!modulePromise) modulePromise = loadWASM();
  return modulePromise;
};

/** @param {ArrayBuffer} pngBuffer */
const downscalePngBuffer = async (pngBuffer) => {
  const blob = new Blob([pngBuffer], { type: 'image/png' });
  const bitmap = await createImageBitmap(blob);
  let { width, height } = bitmap;
  const maxSide = Math.max(width, height);
  if (maxSide <= MAX_LOGO_PX) {
    bitmap.close();
    return pngBuffer;
  }
  const scale = MAX_LOGO_PX / maxSide;
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const out = await canvas.convertToBlob({ type: 'image/png' });
  return out.arrayBuffer();
};

self.onmessage = async (event) => {
  const { id, bytes, ext, type } = event.data;

  if (type === 'warmup') {
    try {
      await ensureModule();
      self.postMessage({ id, warmed: true });
    } catch (error) {
      self.postMessage({
        id,
        error: error instanceof Error ? error.message : 'Warmup fallito',
      });
    }
    return;
  }

  try {
    const Module = await ensureModule();
    const inputName = `input-${id}.${ext}`;
    const outputName = `output-${id}.png`;

    Module.FS.writeFile(inputName, new Uint8Array(bytes));
    try {
      const code = Module.callMain(['-sDEVICE=pngalpha', `-r${GS_DPI}`, '-dNOPAUSE', '-dBATCH', '-dEPSCrop', `-sOutputFile=${outputName}`, inputName]);
      if (code !== 0) throw new Error('Conversione EPS/PS fallita');

      const png = Module.FS.readFile(outputName);
      const scaled = await downscalePngBuffer(png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength));
      self.postMessage({ id, png: scaled }, [scaled]);
    } finally {
      try {
        Module.FS.unlink(inputName);
      } catch {
        /* empty */
      }
      try {
        Module.FS.unlink(outputName);
      } catch {
        /* empty */
      }
    }
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Conversione EPS/PS fallita',
    });
  }
};
