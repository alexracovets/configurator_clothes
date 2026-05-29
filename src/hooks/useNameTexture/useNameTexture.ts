"use client";

import { useMemo } from "react";
import * as THREE from "three";

import type { GizmoZone } from "@types";

import { drawDecal } from "./decalCanvas";

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

const useNameTexture = ({ text, font, fontSize, textColor, strokeColor, strokeWidth, showGizmo, hoveredZone = null }: UseNameTextureParams): THREE.CanvasTexture => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    drawDecal(canvas, { text, font, fontSize, textColor, strokeColor, strokeWidth, showGizmo, hoveredZone });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [text, font, fontSize, textColor, strokeColor, strokeWidth, showGizmo, hoveredZone]);
};

export { useNameTexture };
