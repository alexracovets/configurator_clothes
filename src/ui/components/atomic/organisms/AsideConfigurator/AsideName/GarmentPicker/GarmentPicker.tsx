'use client';

import { useState } from 'react';

import { AtomImage, Button, Flex, PopoverAtom, PopoverAtomContent, PopoverAtomTrigger, Text } from '@atoms';
import { useGarmentStore } from '@store';

import type { GarmentType } from '@data';
import { getGarmentConfig } from '@data';

interface GarmentPickerProps {
  min_buy: number;
  number: number;
}

const GarmentPicker = ({ min_buy, number }: GarmentPickerProps) => {
  const [open, setOpen] = useState(false);
  const { styleId, activeGarment, availableGarments, setActiveGarment } = useGarmentStore();

  const garmentOptions = availableGarments.map((garment) => {
    const config = getGarmentConfig(styleId, garment);
    return {
      garment,
      label: config.label,
      name: config.name,
      previewUrl: config.previewUrl ?? config.patterns[0]?.url ?? '',
    };
  });

  const handleSelect = (garment: GarmentType) => {
    setActiveGarment(garment);
    setOpen(false);
  };

  return (
    <PopoverAtom open={open} onOpenChange={setOpen}>
      <PopoverAtomTrigger asChild>
        <button type="button" className="cursor-pointer text-left">
          <Flex className="flex-col items-start px-3 py-2 rounded-[4px] bg-primary hover:bg-primary/90 transition-colors">
            <Text className="font-semibold">Prodotto {number + 1}</Text>
            <Text className="text-[14px] text-gray">Minimo {min_buy} pz</Text>
          </Flex>
        </button>
      </PopoverAtomTrigger>
      <PopoverAtomContent variant="default" gap="sm" className="p-3 min-w-[220px]" align="end">
        <Text variant="configurator_part_label" className="px-1">
          Scegli capo
        </Text>
        <Flex className="gap-2">
          {garmentOptions.map(({ garment, label, previewUrl }) => {
            const isActive = activeGarment === garment;
            return (
              <Button
                key={garment}
                variant="select_part"
                title={label}
                data-active={isActive}
                className="h-[90px] flex-1 min-w-[80px]"
                onClick={() => handleSelect(garment)}
              >
                {previewUrl ? <AtomImage src={previewUrl} alt={label} /> : <span>{label}</span>}
              </Button>
            );
          })}
        </Flex>
      </PopoverAtomContent>
    </PopoverAtom>
  );
};

export { GarmentPicker };
