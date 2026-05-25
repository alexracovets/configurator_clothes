"use client";

import * as THREE from "three";

import { useShirtMaterial } from "@hooks";
import type { PBRMaps } from "@types";

interface ColorLayerProps {
  geometry: THREE.BufferGeometry;
  colorGradientTexture: THREE.CanvasTexture;
  maps: PBRMaps;
}

export const ColorLayer = ({ geometry, colorGradientTexture, maps }: ColorLayerProps) => {
  const mat = useShirtMaterial(colorGradientTexture, maps);

  return <mesh geometry={geometry} material={mat} renderOrder={0} />;
};
