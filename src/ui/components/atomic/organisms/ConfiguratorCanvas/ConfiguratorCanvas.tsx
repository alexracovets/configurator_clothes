"use client";

import { Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { LoadModel } from "./LoadModel";
import { ViewControls } from "./ViewControls";
import { CanvasButtons } from "./CanvasButtons";

const ConfiguratorCanvas = () => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          stencil: true,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1} />
        <ViewControls />
        <Center position={[0, 0, 0]}>
          <LoadModel />
        </Center>
      </Canvas>
      <CanvasButtons />
    </div>
  );
};

export { ConfiguratorCanvas };
