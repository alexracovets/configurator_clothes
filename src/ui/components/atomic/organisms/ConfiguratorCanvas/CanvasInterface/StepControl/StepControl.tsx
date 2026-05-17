"use client";

import { IoMdUndo, IoMdRedo } from "react-icons/io";

import { Flex, Button } from "@atoms";

const StepControl = () => {
  return (
    <Flex className="absolute right-0 top-0 h-full w-[253px] pointer-events-auto items-start justify-between">
      <Button size="sm">
        <IoMdUndo className="size-4" />
        Annulla
      </Button>
      <Button size="sm">
        Ripristina
        <IoMdRedo className="size-4" />
      </Button>
    </Flex>
  );
};

export { StepControl };
