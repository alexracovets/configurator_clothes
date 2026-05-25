"use client";

import { ConfiguratorCanvas } from "@organisms";
import { AsideConfigurator } from "@organisms";
import { MenuStepBuy, StepsControl, CanvasButtons } from "@molecules";
import { Container, Box, Flex } from "@atoms";

const ConfiguratorPage = () => {
  return (
    <div className="relative w-full h-full">
      <ConfiguratorCanvas />

      <div className="absolute inset-0 pointer-events-none">
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
      </div>
    </div>
  );
};

export { ConfiguratorPage };
