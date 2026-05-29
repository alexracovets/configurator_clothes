import * as THREE from 'three';

const applyTextureUploadMode = (texture: THREE.CanvasTexture, interacting: boolean): void => {
  const wantMipmaps = !interacting;
  if (texture.generateMipmaps === wantMipmaps) return;
  texture.generateMipmaps = wantMipmaps;
  texture.minFilter = wantMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  texture.needsUpdate = true;
};

const createCanvasTexture = (size: number): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return { canvas, texture };
};

export { applyTextureUploadMode, createCanvasTexture };
