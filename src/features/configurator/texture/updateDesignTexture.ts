import * as THREE from "three";
import Konva from "konva";

/**
 * Reads the current pixel data from a Konva Stage canvas and pushes it
 * into an existing THREE.CanvasTexture, triggering a GPU upload.
 *
 * Call this whenever the Konva stage changes (e.g. on `stage.on("change")`).
 */
export function updateDesignTexture(
  stage: Konva.Stage,
  texture: THREE.CanvasTexture,
): void {
  // Konva exposes the underlying HTMLCanvas via .toCanvas()
  const canvas = stage.toCanvas() as HTMLCanvasElement;
  // Re-assign the image source and mark for GPU re-upload
  (texture as THREE.CanvasTexture & { image: HTMLCanvasElement }).image = canvas;
  texture.needsUpdate = true;
}

/**
 * Creates a new THREE.CanvasTexture pre-configured for jersey use.
 * flipY = false is critical when textures are authored in UV space
 * (which matches WebGL's coordinate system without flipping).
 */
export function createCanvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
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
}
