import * as THREE from "three";

export interface DesignOverlayMaterialOptions {
  baseMap?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  bakeNormalMap?: THREE.Texture | null;
}

export interface DesignOverlayMaterial extends THREE.MeshPhysicalMaterial {
  uniforms: { uDesignMap: { value: THREE.Texture }; uDesignOpacity: { value: number } };
  setDesignTexture(tex: THREE.Texture | null): void;
}
