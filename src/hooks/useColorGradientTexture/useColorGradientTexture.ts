import { useMemo } from "react";
import * as THREE from "three";

import type { PartGradient } from "@store";

export const useColorGradientTexture = (
  gradient: PartGradient,
  baseColor: string,
): THREE.CanvasTexture => {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base color fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    if (gradient.enabled) {
      const half = size / 2;
      const rad = (gradient.rotation * Math.PI) / 180;
      const dx = Math.cos(rad) * size;
      const dy = Math.sin(rad) * size;

      const grad = ctx.createLinearGradient(
        half - dx / 2,
        half - dy / 2,
        half + dx / 2,
        half + dy / 2,
      );

      const mid = gradient.position / 100;
      const spread = (gradient.softness / 100) * 0.5;
      const stop0 = Math.max(0, mid - spread);
      const stop1 = Math.min(1, Math.max(mid + spread, stop0 + 0.001));
      const alpha = gradient.opacity / 100;

      const c2 = new THREE.Color(gradient.color2);
      const rgba = `rgba(${Math.round(c2.r * 255)},${Math.round(c2.g * 255)},${Math.round(c2.b * 255)},${alpha})`;

      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(stop0, "rgba(0,0,0,0)");
      grad.addColorStop(stop1, rgba);
      grad.addColorStop(1, rgba);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [gradient, baseColor]);
};
