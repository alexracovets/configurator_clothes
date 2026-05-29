import * as THREE from "three";
import Konva from "konva";

const updateDesignTexture = (stage: Konva.Stage, texture: THREE.CanvasTexture): void => {
  const canvas = stage.toCanvas() as HTMLCanvasElement;
  (texture as THREE.CanvasTexture & { image: HTMLCanvasElement }).image = canvas;
  texture.needsUpdate = true;
};

const createCanvasTexture = (canvas: HTMLCanvasElement): THREE.CanvasTexture => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};

export { updateDesignTexture, createCanvasTexture };
