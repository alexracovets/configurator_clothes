import { useMemo } from "react";
import * as THREE from "three";

const useBaseColorTexture = (baseColor: string): THREE.CanvasTexture => {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [baseColor]);
};

export { useBaseColorTexture };
