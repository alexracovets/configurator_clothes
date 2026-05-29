import * as THREE from "three";

import type { PrintZoneKey } from "@types";

export interface PartDesignMaterialOptions {
  zone: PrintZoneKey;
  baseMap?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  colorTexture?: THREE.Texture | null;
}
