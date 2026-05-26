"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import {
  createDesignOverlayMaterial,
  type DesignOverlayMaterial,
} from "../materials/DesignOverlayMaterial";
import { useDesignTexture } from "./useDesignTexture";
import type { PrintZoneKey } from "../texture/textureConstants";

export interface PartDesignMaterialOptions {
  zone: PrintZoneKey;
  baseMap?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  /** Gradient / base-colour texture produced by the existing colour system */
  colorTexture?: THREE.Texture | null;
}

/**
 * Returns a MeshPhysicalMaterial extended with the design overlay.
 * The material is memoised — it is only recreated when PBR maps change.
 * The design texture slot is updated reactively whenever layers change.
 */
export function usePartDesignMaterial({
  zone,
  baseMap,
  normalMap,
  roughnessMap,
  aoMap,
  colorTexture,
}: PartDesignMaterialOptions): DesignOverlayMaterial {
  const { texture: designTexture } = useDesignTexture(zone);

  const mat = useMemo(
    () =>
      createDesignOverlayMaterial({
        baseMap: colorTexture ?? baseMap ?? null,
        normalMap: normalMap ?? null,
        roughnessMap: roughnessMap ?? null,
        aoMap: aoMap ?? null,
      }),
    [baseMap, normalMap, roughnessMap, aoMap, colorTexture],
  );

  // Keep design texture slot in sync
  useEffect(() => {
    mat.setDesignTexture(designTexture);
  }, [mat, designTexture]);

  // Dispose current material instance on unmount
  useEffect(() => {
    const current = mat;
    return () => {
      current.dispose();
    };
  }, [mat]);

  return mat;
}
