"use client";

import { Environment } from "@react-three/drei";
import { ViewControls } from "./ViewControls";

const CanvasControl = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.9} />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} />
      <directionalLight position={[0, -5, 5]} intensity={0.3} />
      <directionalLight position={[-3, 3, 5]} intensity={0.4} />
      <Environment preset="studio" background={false} environmentIntensity={0.3} />
      <ViewControls />
    </>
  );
};

export { CanvasControl };
