import { useMemo } from 'react';

import * as THREE from 'three';

const useBaseColorTexture = (baseColor: string): THREE.CanvasTexture => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [baseColor]);
};

export { useBaseColorTexture };
