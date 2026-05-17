"use client";

import { AsideConfigurator } from "@organisms";
import type { ChildrenType } from "@types";
import { Container, Grid } from "../../atoms";

export const ConfiguratorTemplate = ({ children }: ChildrenType) => {
  return (
    <main className="relative">
      <Grid variant="configurator" asChild>
        <Container className="min-h-0 h-full">
          <AsideConfigurator />
          {children}
          <div />
        </Container>
      </Grid>
    </main>
  );
};
