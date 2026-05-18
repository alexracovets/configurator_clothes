"use client";

import { IoMdUndo, IoMdRedo } from "react-icons/io";

import { useConfiguratorStore } from "@store";
import { Flex, Button } from "@atoms";

const StepControl = () => {
  const { currentStep, prevStep, nextStep } = useConfiguratorStore();

  return (
    <Flex className="absolute right-0 top-0 h-full w-[253px] pointer-events-auto items-start justify-between">
      <Button size="sm" onClick={prevStep} disabled={currentStep === 0}>
        <IoMdUndo className="size-4" />
        Annulla
      </Button>
      <Button size="sm" onClick={nextStep} disabled={currentStep === 5}>
        Ripristina
        <IoMdRedo className="size-4" />
      </Button>
    </Flex>
  );
};

export { StepControl };
