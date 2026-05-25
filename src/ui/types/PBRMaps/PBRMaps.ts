import * as THREE from "three";

export interface PBRMaps {
  /** Baked large-scale normals — UV1 (TEXCOORD_1) */
  bakeNormal: THREE.Texture;
  /** Packed AO (R) + Roughness (G) bake — UV1 (TEXCOORD_1) */
  bakeAoRoughness: THREE.Texture;
  /** Tiled fabric normals — inside mesh (UV0) */
  fabricNormal: THREE.Texture;
  /** Tiled fabric roughness — exterior mesh (UV0) */
  fabricRoughness: THREE.Texture;
}
