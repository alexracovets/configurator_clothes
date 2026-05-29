'use client';

import { usePathname } from 'next/navigation';

import { Notification } from '@molecules';
import { Box, Container, Flex, Grid } from '@atoms';

const Footer = () => {
  const pathname = usePathname();
  const isHidden = pathname === '/configurator' || pathname === '/uv-debug';

  if (isHidden) return null;

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
