"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { drawNameDecal, type GizmoZone } from "./nameDecalCanvas";

interface UseNameTextureParams {
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  showGizmo: boolean;
  hoveredZone?: GizmoZone | null;
}

export const useNameTexture = ({
  text,
  font,
  fontSize,
  textColor,
  strokeColor,
  strokeWidth,
  showGizmo,
  hoveredZone = null,
}: UseNameTextureParams): THREE.CanvasTexture => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    drawNameDecal(canvas, {
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
