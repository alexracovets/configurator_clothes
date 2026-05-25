"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { drawDecal, type GizmoZone } from "./decalCanvas";

interface UseDecalTextureParams {
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  showGizmo: boolean;
  hoveredZone?: GizmoZone | null;
}

export const useDecalTexture = ({
  text,
  font,
  fontSize,
  textColor,
  strokeColor,
  strokeWidth,
  showGizmo,
  hoveredZone = null,
}: UseDecalTextureParams): THREE.CanvasTexture => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    drawDecal(canvas, {
      text,
      font,
      fontSize,
      textColor,
      strokeColor,
      strokeWidth,
      showGizmo,
      hoveredZone,
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [
    text,
    font,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    showGizmo,
    hoveredZone,
  ]);
};
