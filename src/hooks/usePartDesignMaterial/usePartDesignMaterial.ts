"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import { createDesignOverlayMaterial, type DesignOverlayMaterial } from "@utils";
import { useDesignTexture } from "@hooks";
import type { PrintZoneKey } from "@utils";

export interface PartDesignMaterialOptions {
  zone: PrintZoneKey;
  baseMap?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  colorTexture?: THREE.Texture | null;
}

const usePartDesignMaterial = ({ zone, baseMap, normalMap, roughnessMap, aoMap, colorTexture }: PartDesignMaterialOptions): DesignOverlayMaterial => {
  const { texture: designTexture } = useDesignTexture(zone);

  const mat = useMemo(
    () => createDesignOverlayMaterial({ baseMap: colorTexture ?? baseMap ?? null, normalMap: normalMap ?? null, roughnessMap: roughnessMap ?? null, aoMap: aoMap ?? null }),
    [baseMap, normalMap, roughnessMap, aoMap, colorTexture],
  );

  useEffect(() => { mat.setDesignTexture(designTexture); }, [mat, designTexture]);

  useEffect(() => { const current = mat; return () => { current.dispose(); }; }, [mat]);

  return mat;
};

export { usePartDesignMaterial };
