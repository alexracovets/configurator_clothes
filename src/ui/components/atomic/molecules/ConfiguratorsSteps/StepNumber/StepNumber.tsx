'use client';

import { useState } from 'react';

import { ColorTabControl, FontSelectRow, RangeControl } from '@molecules';
import { AcordionAtom, Button, Flex, PopoverAtom, PopoverAtomContent, PopoverAtomTrigger, Text } from '@atoms';
import { useNumberStore } from '@store';
import type { AcordionItem, NumberInstance, NumberPosition } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

const POSITION_LABELS: Record<NumberPosition, string> = {
  front_left: 'Front Left',
  front_right: 'Front Right',
  back: 'Back',
};

interface NumberFormProps {
  inst: NumberInstance;
  onUpdate: (patch: Partial<Omit<NumberInstance, 'id' | 'position'>>) => void;
  onRemove: () => void;
}

const NumberForm = ({ inst, onUpdate, onRemove }: NumberFormProps) => (
  <Flex variant="configurator_part" className="gap-4 pt-2">
    <FontSelectRow font={inst.font} onChange={(font) => onUpdate({ font })} />

    <Flex variant="configurator_part">
      <Text variant="configurator_part_label">Numero</Text>
      <input
        type="text"
        inputMode="numeric"
        value={inst.text}
        maxLength={2}
        onChange={(e) => onUpdate({ text: e.target.value.replace(/\D/g, '') })}
        className="w-full h-10 bg-white border border-input-border rounded-[8px] px-3 text-sm font-inter text-default outline-none focus:border-active transition-colors"
        placeholder="9"
      />
    </Flex>

    <ColorTabControl
      textColor={inst.textColor}
      strokeColor={inst.strokeColor}
      onTextColor={(textColor) => onUpdate({ textColor })}
      onStrokeColor={(strokeColor) => onUpdate({ strokeColor })}
    />

    <RangeControl label="Spessore contorno" value={inst.strokeWidth} onChange={(strokeWidth) => onUpdate({ strokeWidth })} min={0} max={20} unit="px" />
    <RangeControl label="Altezza e larghezza" value={inst.fontSize} onChange={(fontSize) => onUpdate({ fontSize })} min={24} max={200} unit="px" />

    <Button variant="destructive" size="sm" className="w-full justify-center" onClick={onRemove}>
      Rimuovi
    </Button>
  </Flex>
);

const POSITIONS = shirtConfig.numberPositions.map(({ position, label }) => ({ value: position, label }));

const StepNumber = () => {
  const instances = useNumberStore(({ instances }) => instances);
  const addInstance = useNumberStore(({ addInstance }) => addInstance);
  const updateInstance = useNumberStore(({ updateInstance }) => updateInstance);
  const removeInstance = useNumberStore(({ removeInstance }) => removeInstance);

  const [popoverOpen, setPopoverOpen] = useState(false);

  const takenPositions = new Set(instances.map((i) => i.position));
  const allTaken = takenPositions.size >= POSITIONS.length;

  const items: AcordionItem[] = instances.map((inst) => ({
    value: inst.id,
    trigger: <span className="text-sm font-inter font-medium">{POSITION_LABELS[inst.position]}</span>,
    content: <NumberForm inst={inst} onUpdate={(patch) => updateInstance(inst.id, patch)} onRemove={() => removeInstance(inst.id)} />,
  }));

  return (
    <Flex variant="step_design">
      {instances.length > 0 && <AcordionAtom items={items} defaultValue={[instances[0].id]} multiple />}

      {!allTaken && (
        <PopoverAtom open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverAtomTrigger asChild>
            <Button variant="default" size="sm" className="w-full justify-center gap-2">
              <span className="text-lg leading-none">+</span>
              Aggiungi numero
            </Button>
          </PopoverAtomTrigger>
          <PopoverAtomContent variant="default" gap="sm" className="p-3 min-w-[180px]">
            <Text variant="configurator_part_label" className="px-1">
              Scegli posizione
            </Text>
            {POSITIONS.map(({ value, label }) => (
              <Button
                key={value}
                variant="default"
                size="sm"
                className="w-full justify-start"
                disabled={takenPositions.has(value)}
                onClick={() => {
                  addInstance(value);
                  setPopoverOpen(false);
                }}
              >
                {label}
                {takenPositions.has(value) && <span className="ml-auto text-xs text-gray">✓</span>}
              </Button>
            ))}
          </PopoverAtomContent>
        </PopoverAtom>
      )}
    </Flex>
  );
};

export { StepNumber };
