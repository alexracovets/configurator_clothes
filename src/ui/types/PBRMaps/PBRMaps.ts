import * as THREE from "three";

export interface PBRMaps {
  bakeNormal: THREE.Texture;
  bakeAoRoughness: THREE.Texture;
  fabricNormal: THREE.Texture;
  fabricRoughness: THREE.Texture;
}
