"use client";

import { Flex, Text, Range } from "@atoms";

interface TransparentControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const TransparentControl = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: TransparentControlProps) => {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const clampedValue = Math.min(Math.max(value, safeMin), safeMax);

  const percent = ((clampedValue - safeMin) / (safeMax - safeMin)) * 100;

  const hideMin = percent < 12;
  const hideMax = percent > 83;

  return (
    <Flex variant="configurator_part" className="overflow-hidden">
      {label && <Text variant="configurator_part_label">{label}</Text>}
      <Range
        value={[clampedValue]}
        onValueChange={(values) => {
          const next = ([] as number[]).concat(values)[0];
          onChange(Math.min(Math.max(next, safeMin), safeMax));
        }}
        min={safeMin}
        max={safeMax}
        variant="default"
      />
      <Flex variant="slider_labels">
        <Text
          variant="slider_label"
          style={{ opacity: hideMin ? 0 : 1, transition: "opacity 0.15s" }}
        >
          {safeMin}%
        </Text>
        <Text
          variant="slider_label"
          data-thumb={true}
          style={{
            left: `clamp(0%, ${percent}%, 100%)`,
            translate: percent < 5 ? "0" : percent > 95 ? "-100%" : "-50% 0",
          }}
        >
          {clampedValue}%
        </Text>
        <Text
          variant="slider_label"
          style={{ opacity: hideMax ? 0 : 1, transition: "opacity 0.15s" }}
        >
          {safeMax}%
        </Text>
      </Flex>
    </Flex>
  );
};

export { TransparentControl };
