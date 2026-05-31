import { LogoFileError } from '../logoFileError';

interface WorkerResult {
  id: number;
  png?: ArrayBuffer;
  error?: string;
  warmed?: boolean;
}

let worker: Worker | null = null;
let jobId = 0;
let warmupDone = false;
const pending = new Map<number, { resolve: (url: string) => void; reject: (err: Error) => void }>();

const attachWorkerHandlers = (w: Worker) => {
  w.onmessage = (event: MessageEvent<WorkerResult>) => {
    const { id, png, error, warmed } = event.data;

    if (warmed) {
      warmupDone = true;
      return;
    }

    const job = pending.get(id);
    if (!job) return;
    pending.delete(id);

    if (error) {
      job.reject(new LogoFileError(error));
      return;
    }
    if (!png) {
      job.reject(new LogoFileError('Conversione EPS/PS fallita'));
      return;
    }
    job.resolve(URL.createObjectURL(new Blob([png], { type: 'image/png' })));
  };

  w.onerror = () => {
    for (const [, job] of pending) {
      job.reject(new LogoFileError('Errore worker Ghostscript'));
    }
    pending.clear();
    worker?.terminate();
    worker = null;
    warmupDone = false;
  };
};

const getWorker = (): Worker => {
  if (typeof window === 'undefined') {
    throw new LogoFileError('Conversione EPS/PS disponibile solo nel browser');
  }

  if (!worker) {
    worker = new Worker('/ghostscript/eps-converter.worker.js', { type: 'module' });
    attachWorkerHandlers(worker);
  }

  return worker;
};

/** Preload Ghostscript WASM in a worker while the user is on the logo step. */
const warmupGhostscriptWorker = (): void => {
  if (warmupDone || typeof window === 'undefined') return;
  try {
    const id = ++jobId;
    getWorker().postMessage({ type: 'warmup', id });
  } catch {
    /* optional preload */
  }
};

const convertEpsPsToDisplayUrl = (bytes: Uint8Array, ext: 'eps' | 'ps'): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const id = ++jobId;
      pending.set(id, { resolve, reject });
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      getWorker().postMessage({ id, bytes: buffer, ext }, [buffer]);
    } catch (err) {
      reject(err instanceof LogoFileError ? err : new LogoFileError('Impossibile convertire il file EPS/PS'));
    }
  });

export { convertEpsPsToDisplayUrl, warmupGhostscriptWorker };
