'use client';

import { IoMdRedo, IoMdUndo } from 'react-icons/io';

import { Button, Flex } from '@atoms';
import { useStepsStore } from '@store';

const StepsControl = () => {
  const { currentStep, prevStep, nextStep } = useStepsStore();

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

export { StepsControl };
