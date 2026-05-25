"use client";

import { Html } from "@react-three/drei";

import { MenuStepBuy, StepsControl, CanvasButtons } from "@molecules";
import { AsideConfigurator } from "@organisms";
import { Container, Box, Flex } from "@atoms";

const CanvasInterface = () => {
  return (
    <Html fullscreen wrapperClass="pointer-events-none">
      <Container className="h-full pointer-events-none">
        <Flex className="flex-col w-full h-full gap-y-12 pointer-events-none">
          <div className="pointer-events-auto w-fit">
            <MenuStepBuy />
          </div>
          <Box className="w-full h-full relative select-none pointer-events-none">
            <AsideConfigurator />
            <StepsControl />
            <CanvasButtons />
          </Box>
        </Flex>
      </Container>
    </Html>
  );
};

export { CanvasInterface };
