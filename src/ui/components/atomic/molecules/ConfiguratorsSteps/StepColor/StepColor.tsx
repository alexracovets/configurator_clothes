'use client';

import { ColorControl, PartColorSwitch } from '@molecules';
import { AcordionAtom, Flex } from '@atoms';
import { SHIRT_PARTS, useColorStore } from '@store';

const StepColor = () => {
  const { partColors, setPartColor } = useColorStore();

  const items = SHIRT_PARTS.map(({ key, name }) => ({
    value: key,
    trigger: <PartColorSwitch label={name} color={partColors[key]} />,
    content: <ColorControl activeColor={partColors[key]} onSelect={(color) => setPartColor(key, color)} />,
  }));
  return (
    <Flex variant="step_design">
      <AcordionAtom items={items} defaultValue={['front']} />
    </Flex>
  );
};

export { StepColor };
