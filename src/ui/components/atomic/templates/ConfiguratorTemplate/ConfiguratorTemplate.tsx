"use client";

import { AsideConfigurator } from "@organisms";
import type { ChildrenType } from "@types";
import { Container, Grid } from "../../atoms";

export const ConfiguratorTemplate = ({ children }: ChildrenType) => {
  return (
    <main>
      <Container>
        <Grid variant="configurator">
          <AsideConfigurator />
          {children}
          <div />
        </Grid>
      </Container>
    </main>
  );
};
