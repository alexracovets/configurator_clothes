"use client";

import { Environment } from "@react-three/drei";
import { ViewControls } from "./ViewControls";

const CanvasControl = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.4} />
      <directionalLight position={[-5, 5, -5]} intensity={0.2} /> 
      <ViewControls />
    </>
  );
};

export { CanvasControl };
