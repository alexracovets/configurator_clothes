'use client';

import { ColorControl, PartColorSwitch } from '@molecules';
import { AccordionAtom, Flex } from '@atoms';
import { useActivePartColors, useColorStore } from '@store';
import { useGarmentParts } from '@hooks';

const StepColor = () => {
  const partColors = useActivePartColors();
  const { setPartColor } = useColorStore();
  const garmentParts = useGarmentParts();

  const items = garmentParts.map(({ key, name }) => ({
    value: key,
    trigger: <PartColorSwitch label={name} color={partColors[key]} />,
    content: <ColorControl activeColor={partColors[key]} onSelect={(color) => setPartColor(key, color)} />,
  }));

  return (
    <Flex variant="step_design">
      <AccordionAtom items={items} defaultValue={[garmentParts[0]?.key ?? 'front']} />
    </Flex>
  );
};

export { StepColor };
