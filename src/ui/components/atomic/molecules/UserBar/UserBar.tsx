'use client';

import { Button, Flex } from '@atoms';

import { CartIcon } from './CartIcon';
import { UserIcon } from './UserIcon';

const UserBar = () => {
  return (
    <Flex variant="user_bar">
      <Button variant="ghost" size="icon">
        <UserIcon />
      </Button>
      <Button variant="ghost" size="icon">
        <CartIcon />
      </Button>
    </Flex>
  );
};

export { UserBar };
