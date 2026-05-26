"use client";

import React from "react";
import * as THREE from "three";

import { usePartDesignMaterial } from "../../hooks/usePartDesignMaterial";
import type { PrintZoneKey } from "../../texture/textureConstants";

interface DesignMeshProps {
  geometry:     THREE.BufferGeometry;
  zone:         PrintZoneKey;
  renderOrder?: number;
  /** Base colour / gradient texture from existing useBaseColorTexture / useColorGradientTexture */
  colorTexture?: THREE.Texture | null;
  normalMap?:    THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?:        THREE.Texture | null;
}

export const DesignMesh = ({
  geometry,
  zone,
  renderOrder = 10,
  colorTexture = null,
  normalMap    = null,
  roughnessMap = null,
  aoMap        = null,
}: DesignMeshProps) => {
  const material = usePartDesignMaterial({
    zone,
    colorTexture,
    normalMap,
    roughnessMap,
    aoMap,
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      renderOrder={renderOrder}
    />
  );
};
