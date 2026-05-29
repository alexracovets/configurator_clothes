'use client';

import { Environment } from '@react-three/drei';

import { ViewControls } from './ViewControls';

const CanvasControl = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.68} />
      <directionalLight position={[-5, 5, -5]} intensity={0.46} />
      <directionalLight position={[0, -5, 5]} intensity={0.26} />
      <directionalLight position={[-3, 3, 5]} intensity={0.32} />
      <Environment preset="warehouse" background={false} environmentIntensity={0.19} />
      <ViewControls />
    </>
  );
};

export { CanvasControl };
