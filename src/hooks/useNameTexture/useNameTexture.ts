"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface UseNameTextureParams {
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
}

const CANVAS_W = 1024;
const CANVAS_H = 256;

export const useNameTexture = ({
  text,
  font,
  fontSize,
  textColor,
  strokeColor,
  strokeWidth,
}: UseNameTextureParams): THREE.CanvasTexture => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * 2;
      ctx.lineJoin = "round";
      ctx.strokeText(text, cx, cy);
    }

    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, cy);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [text, font, fontSize, textColor, strokeColor, strokeWidth]);
};
