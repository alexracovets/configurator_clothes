"use client";

import { Html } from "@react-three/drei";

import { CanvasButtons } from "./CanvasButtons";
import { AsideConfigurator } from "@organisms";
import { Container, Box } from "@atoms";

const CanvasInterface = () => {
  return (
    <Html fullscreen>
      <Container className="h-full">
        <Box className="w-full h-full relative select-none">
          <AsideConfigurator />
          <div className="absolute right-0 top-0 h-full w-[253px] pointer-events-auto" />
          <CanvasButtons />
        </Box>
      </Container>
    </Html>
  );
};

export { CanvasInterface };
