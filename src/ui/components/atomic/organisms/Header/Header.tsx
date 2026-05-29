'use client';

import { LangSwitcher, Search, UserBar } from '@molecules';
import { Box, Container, Flex, Grid, Logo } from '@atoms';

const Header = () => {
  return (
    <Box variant="header" asChild>
      <header>
        <Container>
          <Grid variant="header">
            <Flex variant="utility_bar">
              <Search />
              <LangSwitcher />
            </Flex>
            <Logo />
            <UserBar />
          </Grid>
        </Container>
      </header>
    </Box>
  );
};

export { Header };
