"use client";

import { Html } from "@react-three/drei";

import { CanvasButtons } from "./CanvasButtons";
import { StepControl } from "./StepControl";
import { AsideConfigurator } from "@organisms";
import { Container, Box } from "@atoms";

const CanvasInterface = () => {
  return (
    <Html fullscreen>
      <Container className="h-full">
        <Box className="w-full h-full relative select-none">
          <AsideConfigurator />
          <StepControl />
          <CanvasButtons />
        </Box>
      </Container>
    </Html>
  );
};

export { CanvasInterface };
