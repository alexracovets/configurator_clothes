'use client';

import { Button, Flex, Grid, SvgIcon } from '@atoms';
import { PALETTE_COLORS } from '@constants';

interface ColorControlProps {
  activeColor: string;
  onSelect: (color: string) => void;
}

const ColorControl = ({ activeColor, onSelect }: ColorControlProps) => {
  return (
    <Flex variant="configurator_part">
      <Button variant="destructive" size="icon">
        <span>Seleziona il colore</span>
        <SvgIcon name="select_color" />
      </Button>
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
