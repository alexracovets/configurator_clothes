"use client";

import { Environment } from "@react-three/drei";
import { ViewControls } from "./ViewControls";

const CanvasControl = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <Environment preset="studio" />
      <ViewControls />
    </>
  );
};

export { CanvasControl };
