import UTIF from 'utif';

import { canvasToPngBlobUrl } from '../canvasToBlobUrl';
import { LogoFileError } from '../logoFileError';

const convertTiffToDisplayUrl = async (buffer: ArrayBuffer): Promise<string> => {
  try {
    const ifds = UTIF.decode(buffer);
    if (!ifds.length) throw new LogoFileError('File TIFF non valido');

    UTIF.decodeImage(buffer, ifds[0]);
    const rgba = UTIF.toRGBA8(ifds[0]);
    const { width, height } = ifds[0];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new LogoFileError('Impossibile preparare il canvas');

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(rgba);
    ctx.putImageData(imageData, 0, 0);
    return canvasToPngBlobUrl(canvas);
  } catch (err) {
    if (err instanceof LogoFileError) throw err;
    throw new LogoFileError('Impossibile convertire il file TIFF');
  }
};

export { convertTiffToDisplayUrl };
