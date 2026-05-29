"use client";

import { useColorStore, SHIRT_PARTS } from "@store";
import { Flex, AcordionAtom } from "@atoms";
import { ColorControl, PartColorSwatch } from "@molecules";

const StepColor = () => {
  const { partColors, setPartColor } = useColorStore();

  const items = SHIRT_PARTS.map(({ key, italianLabel }) => ({
    value: key,
    trigger: <PartColorSwatch label={italianLabel} color={partColors[key]} />,
    content: <ColorControl activeColor={partColors[key]} onSelect={(color) => setPartColor(key, color)} />,
  }));

  return (
    <Flex variant="step_design">
      <AcordionAtom items={items} defaultValue={["front"]} />
    </Flex>
  );
};

export { StepColor };
