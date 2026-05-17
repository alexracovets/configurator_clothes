"use client";

import { Center, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { LoadModel } from "./LoadModel";

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
        <Center position={[0, 0, 0]}>
          <OrbitControls
            enablePan={false}
            minDistance={0.5}
            maxDistance={3}
            makeDefault
          />
          <LoadModel />
        </Center>
      </Canvas>
    </div>
  );
};

export { ConfiguratorCanvas };
