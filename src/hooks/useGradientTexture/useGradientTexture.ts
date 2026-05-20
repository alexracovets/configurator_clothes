import { useMemo } from "react";
import * as THREE from "three";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function useGradientTexture(
  color1: string,
  color2: string,
  rotation: number,
  position: number,
  opacity: number,
  softness: number,
): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const cx = size / 2;
    const cy = size / 2;
    const rad = (rotation * Math.PI) / 180;
    const dx = Math.cos(rad) * size;
    const dy = Math.sin(rad) * size;

    const grad = ctx.createLinearGradient(
      cx - dx / 2, cy - dy / 2,
      cx + dx / 2, cy + dy / 2,
    );

    const mid = position / 100;
    const half = (softness / 100) * 0.5;
    const start = Math.max(0, mid - half);
    const end = Math.min(1, mid + half);

    const [r, g, b] = hexToRgb(color2);
    const a = opacity / 100;

    // color1 side — повністю прозорий (показує колір секції знизу)
    grad.addColorStop(0, "rgba(0,0,0,0)");
    if (start > 0) grad.addColorStop(start, "rgba(0,0,0,0)");
    // color2 side — з opacity
    if (end < 1) grad.addColorStop(end, `rgba(${r},${g},${b},${a})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${a})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [color1, color2, rotation, position, opacity, softness]);
}
