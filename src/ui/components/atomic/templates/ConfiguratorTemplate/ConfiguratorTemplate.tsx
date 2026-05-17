"use client";

import { AsideConfigurator } from "@organisms";
import { Container, Grid } from "@atoms";

import type { ChildrenType } from "@types";

export const ConfiguratorTemplate = ({ children }: ChildrenType) => {
  return (
    <main>
      <Grid variant="configurator">
        <Container className="min-h-0 h-full">
          <AsideConfigurator />
          {children}
          <div />
        </Container>
      </Grid>
    </main>
  );
};
