import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

import type { PBRTexturePaths, PBRMaps } from "@types";

const usePBRMaps = (paths: PBRTexturePaths): PBRMaps => {
  const textures = useTexture(paths as unknown as Record<string, string>) as Record<string, THREE.Texture>;
  const { bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness } = textures;

  useMemo(() => {
    for (const tex of [bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness]) {
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
    }
  }, [bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness]);

  return { bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness };
};

export { usePBRMaps };
