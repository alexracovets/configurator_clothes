"use client";

import { useColorStore, SHIRT_PARTS, ShirtPart } from "@store";
import { Flex, Text, AcordionAtom } from "@atoms";
import { ColorControl } from "@molecules";

const PART_LABELS: Record<ShirtPart, string> = {
  front: "Davanti",
  back: "Retro",
  sleeve_left: "Manica 1",
  sleeve_right: "Manica 2",
  collar: "Colletto",
};

const StepColor = () => {
  const { partColors, setPartColor } = useColorStore();

  const items = SHIRT_PARTS.map(({ key }) => ({
    value: key,
    trigger: (
      <Flex className="gap-3 items-center">
        <div
          className="w-5 h-5 rounded-[4px] border border-gray-200 shrink-0"
          style={{ backgroundColor: partColors[key] }}
        />
        <Text className="text-sm font-medium text-gray-800">
          {PART_LABELS[key]}
        </Text>
      </Flex>
    ),
    content: (
      <ColorControl
        activeColor={partColors[key]}
        onSelect={(color) => setPartColor(key, color)}
      />
    ),
  }));

  return (
    <Flex variant="step_design">
      <AcordionAtom items={items} defaultValue={["front"]} />
    </Flex>
  );
};

export { StepColor };
