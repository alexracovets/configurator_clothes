"use client";

import { Button, Flex } from "@atoms";
import { UserIcon } from "./UserIcon";
import { CartIcon } from "./CartIcon";

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
