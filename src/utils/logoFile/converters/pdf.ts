import { canvasToPngBlobUrl } from '../canvasToBlobUrl';
import { LogoFileError } from '../logoFileError';

let pdfjsModule: typeof import('pdfjs-dist') | null = null;

const ensurePdfJs = async (): Promise<typeof import('pdfjs-dist')> => {
  if (pdfjsModule) return pdfjsModule;
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  pdfjsModule = pdfjs;
  return pdfjs;
};

const convertPdfToDisplayUrl = async (buffer: ArrayBuffer, scale = 2): Promise<string> => {
  try {
    const pdfjs = await ensurePdfJs();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new LogoFileError('Impossibile preparare il canvas');

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    page.cleanup();
    await pdf.destroy();
    return canvasToPngBlobUrl(canvas);
  } catch {
    throw new LogoFileError('Impossibile convertire il file PDF');
  }
};

export { convertPdfToDisplayUrl };
