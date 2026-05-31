import { LogoFileError } from '../logoFileError';

let magickInitPromise: Promise<void> | null = null;

const ensureMagick = async (): Promise<typeof import('@imagemagick/magick-wasm')> => {
  const magick = await import('@imagemagick/magick-wasm');
  if (!magickInitPromise) {
    magickInitPromise = (async () => {
      const res = await fetch('/magick.wasm');
      if (!res.ok) {
        throw new LogoFileError('ImageMagick WASM non trovato. Esegui: pnpm copy:logo-assets');
      }
      await magick.initializeImageMagick(await res.arrayBuffer());
    })().catch((err) => {
      magickInitPromise = null;
      throw err;
    });
  }
  await magickInitPromise;
  return magick;
};

const convertWithMagick = async (bytes: Uint8Array): Promise<string> => {
  try {
    const { ImageMagick, MagickFormat } = await ensureMagick();
    return await ImageMagick.read(
      bytes,
      (img) =>
        new Promise<string>((resolve, reject) => {
          try {
            img.write(MagickFormat.Png, (data) => {
              resolve(URL.createObjectURL(new Blob([new Uint8Array(data)], { type: 'image/png' })));
            });
          } catch (err) {
            reject(err);
          }
        }),
    );
  } catch (err) {
    if (err instanceof LogoFileError) throw err;
    throw new LogoFileError('Impossibile convertire il file (AI legacy o BMP)');
  }
};

export { convertWithMagick };
