"use client";

import { Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { CanvasInterface } from "./CanvasInterface";
import { CanvasControl } from "./CanvasControl";
import { LoadModel } from "./LoadModel";

const ConfiguratorCanvas = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        stencil: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      dpr={[1, 2]}
    >
      <CanvasControl />
      <Center position={[0, 0, 0]}>
        <LoadModel />
      </Center>
      <CanvasInterface />
    </Canvas>
  );
};

export { ConfiguratorCanvas };
