"use client";

import { Flex, Text, Grid, Button } from "@atoms";

const COLORS = [
  "#C0392B",
  "#2980B9",
  "#F1C40F",
  "#F9FF00",
  "#1A2744",
  "#111111",
  "#FFFFFF",
  "#C8A96E",
  "#7D3C98",
  "#27AE60",
  "#E74C3C",
  "#FF00FF",
  "#1ABC9C",
  "#6E2C00",
  "#145A32",
];

interface ColorControlProps {
  activeColor: string;
  onSelect: (color: string) => void;
  label?: string;
}

const ColorControl = ({ activeColor, onSelect, label }: ColorControlProps) => {
  return (
    <Flex variant="configurator_part">
      {label && <Text variant="configurator_part_label">{label}</Text>}
      <Grid variant="select_parts">
        {COLORS.map((color, idx) => {
          return (
            <Button
              key={idx}
              variant="select_part_short"
              data-active={activeColor === color}
              style={{ backgroundColor: color }}
              onClick={() => onSelect(color)}
            />
          );
        })}
      </Grid>
    </Flex>
  );
};

export { COLORS, ColorControl };
