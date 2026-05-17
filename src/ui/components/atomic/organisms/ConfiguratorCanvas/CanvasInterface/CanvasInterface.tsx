"use client";

import { Html } from "@react-three/drei";

import { MenuStepBuy, StepControl, CanvasButtons } from "@molecules";
import { AsideConfigurator } from "@organisms";
import { Container, Box, Flex } from "@atoms";

const CanvasInterface = () => {
  return (
    <Html fullscreen>
      <Container className="h-full">
        <Flex className="flex-col w-full h-full gap-y-12">
          <MenuStepBuy />
          <Box className="w-full h-full relative select-none">
            <AsideConfigurator />
            <StepControl />
            <CanvasButtons />
          </Box>
        </Flex>
      </Container>
    </Html>
  );
};

export { CanvasInterface };
