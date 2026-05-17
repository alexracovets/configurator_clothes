"use client";

import { ViewControls } from "./ViewControls";

const CanvasControl = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <ViewControls />
    </>
  );
};

export { CanvasControl };
