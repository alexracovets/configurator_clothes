'use client';

import { Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { PALETTE_COLORS } from '@constants';

import { ColorPicker } from './ColorPicker';
import { HexInput } from './HexInput';

interface ColorControlProps {
  activeColor: string;
  onSelect: (color: string) => void;
  label?: string;
}

const ColorControl = ({ activeColor, onSelect, label }: ColorControlProps) => {
  return (
    <Flex variant="configurator_part">
      {label && <Text variant="configurator_part_label">{label}</Text>}
      <Grid className="grid-cols-[auto_auto] items-center justify-between gap-2 w-full">
        <ColorPicker
          color={activeColor}
          onChange={onSelect}
          trigger={
            <Button variant="destructive" size="icon">
              <span>Seleziona il colore</span>
              <SvgIcon name="select_color" />
            </Button>
          }
        />
        <HexInput value={activeColor} onChange={onSelect} />
      </Grid>
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
