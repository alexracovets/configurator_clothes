'use client';

import { Button, Flex, Grid, Text } from '@atoms';
import { PALETTE_COLORS } from '@constants';

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
        {PALETTE_COLORS.map((color, idx) => (
          <Button
            key={idx}
            variant="select_part_short"
            data-active={activeColor === color}
            style={{ backgroundColor: color }}
            onClick={() => onSelect(color)}
          />
        ))}
      </Grid>
    </Flex>
  );
};

export { ColorControl };
