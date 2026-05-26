"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

import { useDesignOverlayMaterial } from "@hooks";
import type { ShirtPart } from "@store";

interface DesignOverlayLayerProps {
  part: ShirtPart;
  geometry: THREE.BufferGeometry;
  designTexture: THREE.CanvasTexture;
  renderOrder?: number;
}

export const DesignOverlayLayer = ({
  part,
  geometry,
  designTexture,
  renderOrder = 3,
}: DesignOverlayLayerProps) => {
  const material = useDesignOverlayMaterial(part, designTexture);
  const meshRef = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Visual-only layer — hit tests use the named ColorLayer mesh underneath.
    mesh.raycast = () => {};
  }, []);

  return (
    <mesh
      ref={meshRef}
      name={`${part}_design_overlay`}
      geometry={geometry}
      material={material}
      renderOrder={renderOrder}
    />
  );
};
