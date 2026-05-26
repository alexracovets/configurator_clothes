"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

import { type PartGradient, type ShirtPart } from "@store";
import { useShirtDesignMaterial } from "@hooks";
import type { PBRMaps } from "@types";

interface ColorLayerProps {
  part: ShirtPart;
  geometry: THREE.BufferGeometry;
  baseColorTexture: THREE.CanvasTexture;
  gradient: PartGradient;
  maps: PBRMaps;
  renderOrder?: number;
  /** Design canvas texture composited over fabric via shader */
  designTexture: THREE.CanvasTexture;
}

const meshRaycast = THREE.Mesh.prototype.raycast;

export const ColorLayer = ({
  part,
  geometry,
  baseColorTexture,
  gradient,
  maps,
  renderOrder = 0,
  designTexture,
}: ColorLayerProps) => {
  const matWithDesign = useShirtDesignMaterial(
    baseColorTexture,
    maps,
    gradient,
    part,
    designTexture,
  );

  const meshRef = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.raycast = meshRaycast;
  }, []);

  return (
    <mesh
      ref={meshRef}
      name={part}
      geometry={geometry}
      material={matWithDesign}
      renderOrder={renderOrder}
    />
  );
};
