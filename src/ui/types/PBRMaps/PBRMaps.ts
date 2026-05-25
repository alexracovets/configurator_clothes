import * as THREE from "three";

export interface PBRMaps {
  /** Baked large-scale normals — UV1 (TEXCOORD_1) */
  bakeNormal: THREE.Texture;
  /** Packed AO (R) + Roughness (G) bake — UV1 (TEXCOORD_1) */
  bakeAoRoughness: THREE.Texture;
  /** Tiled fabric detail normals — UV0 (TEXCOORD_0) */
  fabricNormal: THREE.Texture;
  /** Tiled fabric roughness — UV0 (TEXCOORD_0) */
  fabricRoughness: THREE.Texture;
}
