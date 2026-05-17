"use client";

import { Container, Flex, Grid, Box } from "@atoms";
import { Notification } from "@molecules";

const Footer = () => {
  return (
    <Box variant="footer" asChild>
      <footer>
        <Container>
          <Grid className="grid-cols-[1fr_auto] items-center">
            <Flex></Flex>
            <Notification />
          </Grid>
        </Container>
      </footer>
    </Box>
  );
};

export { Footer };
