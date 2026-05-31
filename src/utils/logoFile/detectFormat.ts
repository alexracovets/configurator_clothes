import { LOGO_ACCEPTED_EXTENSIONS, LOGO_ACCEPTED_MIMES } from './constants';

const getExtension = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
};

const findPdfOffset = (bytes: Uint8Array): number => {
  const marker = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  outer: for (let i = 0; i <= bytes.length - marker.length; i++) {
    for (let j = 0; j < marker.length; j++) {
      if (bytes[i + j] !== marker[j]) continue outer;
    }
    return i;
  }
  return -1;
};

const isAcceptedLogoFile = (file: File): boolean => {
  const ext = getExtension(file.name);
  if (LOGO_ACCEPTED_EXTENSIONS.has(ext)) return true;
  return LOGO_ACCEPTED_MIMES.has(file.type);
};

export { findPdfOffset, getExtension, isAcceptedLogoFile };
