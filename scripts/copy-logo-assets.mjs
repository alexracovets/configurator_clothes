import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const copies = [
  ['node_modules/@imagemagick/magick-wasm/dist/magick.wasm', 'public/magick.wasm'],
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs'],
  ['node_modules/@okathira/ghostpdl-wasm/dist/gs.js', 'public/ghostscript/gs.js'],
  ['node_modules/@okathira/ghostpdl-wasm/dist/gs.wasm', 'public/ghostscript/gs.wasm'],
];

mkdirSync(join(root, 'public/ghostscript'), { recursive: true });

for (const [from, to] of copies) {
  copyFileSync(join(root, from), join(root, to));
}

console.log('Logo assets copied to public/');
