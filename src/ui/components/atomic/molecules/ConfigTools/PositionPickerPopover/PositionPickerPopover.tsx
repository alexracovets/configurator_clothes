'use client';

import { useState } from 'react';

import { Button, PopoverAtom, PopoverAtomContent, PopoverAtomTrigger, Text } from '@atoms';

interface Position {
  value: string;
  label: string;
}

interface PositionPickerPopoverProps {
  positions: Position[];
  takenPositions: Set<string>;
  triggerLabel: string;
  onSelect: (value: string) => void;
}

const PositionPickerPopover = ({ positions, takenPositions, triggerLabel, onSelect }: PositionPickerPopoverProps) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverAtom open={open} onOpenChange={setOpen}>
      <PopoverAtomTrigger asChild>
        <Button variant="default" size="sm" className="w-full justify-center gap-2">
          <span className="text-lg leading-none">+</span>
          {triggerLabel}
        </Button>
      </PopoverAtomTrigger>
      <PopoverAtomContent variant="default" gap="sm" className="p-3 min-w-[180px]">
        <Text variant="configurator_part_label" className="px-1">
          Scegli posizione
        </Text>
        {positions.map(({ value, label }) => (
          <Button
            key={value}
            variant="default"
            size="sm"
            className="w-full justify-start"
            disabled={takenPositions.has(value)}
            onClick={() => {
              onSelect(value);
              setOpen(false);
            }}
          >
            {label}
            {takenPositions.has(value) && <span className="ml-auto text-xs text-gray">✓</span>}
          </Button>
        ))}
      </PopoverAtomContent>
    </PopoverAtom>
  );
};

export { PositionPickerPopover };
