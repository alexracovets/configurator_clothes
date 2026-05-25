"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

import { useNameStore, type PartGradient, type ShirtPart } from "@store";
import { useShirtMaterial } from "@hooks";
import type { PBRMaps } from "@types";

interface ColorLayerProps {
  part: ShirtPart;
  geometry: THREE.BufferGeometry;
  baseColorTexture: THREE.CanvasTexture;
  gradient: PartGradient;
  maps: PBRMaps;
  renderOrder?: number;
}

const meshRaycast = THREE.Mesh.prototype.raycast;

export const ColorLayer = ({
  part,
  geometry,
  baseColorTexture,
  gradient,
  maps,
  renderOrder = 0,
}: ColorLayerProps) => {
  const mat = useShirtMaterial(baseColorTexture, maps, gradient, part);
  const isNameVisible = useNameStore(({ isVisible }) => isVisible);
  const meshRef = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (part === "back" && isNameVisible) {
      mesh.raycast = () => {};
    } else {
      mesh.raycast = meshRaycast;
    }
  }, [part, isNameVisible]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={mat}
      renderOrder={renderOrder}
    />
  );
};
