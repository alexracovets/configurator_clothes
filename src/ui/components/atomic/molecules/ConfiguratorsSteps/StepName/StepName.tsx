'use client';

import { ColorTabControl, FontSelectRow, PositionPickerPopover, RangeControl } from '@molecules';
import { AccordionAtom, Button, Flex, Text } from '@atoms';
import { POSITIONS, useNameStore } from '@store';
import type { AccordionItem, NameInstance, NamePosition } from '@types';

const POSITION_LABELS: Record<NamePosition, string> = {
  top: 'Top Back',
  bottom: 'Bottom Back',
};

interface NameFormProps {
  inst: NameInstance;
  onUpdate: (patch: Partial<Omit<NameInstance, 'id'>>) => void;
  onRemove: () => void;
}

const NameForm = ({ inst, onUpdate, onRemove }: NameFormProps) => (
  <Flex variant="configurator_part" className="gap-4 pt-2">
    <FontSelectRow font={inst.font} onChange={(font) => onUpdate({ font })} />

    <Flex variant="configurator_part">
      <Text variant="configurator_part_label">Testo</Text>
      <input
        type="text"
        value={inst.text}
        maxLength={20}
        onChange={(e) => onUpdate({ text: e.target.value })}
        className="w-full h-10 bg-white border border-input-border rounded-[8px] px-3 text-sm font-inter text-default outline-none focus:border-active transition-colors"
        placeholder="PLAYER NAME"
      />
    </Flex>

    <ColorTabControl
      textColor={inst.textColor}
      strokeColor={inst.strokeColor}
      onTextColor={(textColor) => onUpdate({ textColor })}
      onStrokeColor={(strokeColor) => onUpdate({ strokeColor })}
    />

    <RangeControl label="Spessore contorno" value={inst.strokeWidth} onChange={(strokeWidth) => onUpdate({ strokeWidth })} min={0} max={20} unit="px" />

    <Button variant="destructive" size="sm" className="w-full justify-center" onClick={onRemove}>
      Rimuovi
    </Button>
  </Flex>
);

const StepName = () => {
  const instances = useNameStore(({ instances }) => instances);
  const addInstance = useNameStore(({ addInstance }) => addInstance);
  const updateInstance = useNameStore(({ updateInstance }) => updateInstance);
  const removeInstance = useNameStore(({ removeInstance }) => removeInstance);

  const takenPositions = new Set(instances.map((i) => i.position));
  const allTaken = takenPositions.size >= POSITIONS.length;

  const items: AccordionItem[] = instances.map((inst) => ({
    value: inst.id,
    trigger: <span className="text-sm font-inter font-medium">{POSITION_LABELS[inst.position]}</span>,
    content: <NameForm inst={inst} onUpdate={(patch) => updateInstance(inst.id, patch)} onRemove={() => removeInstance(inst.id)} />,
  }));

  return (
    <Flex variant="step_design">
      {instances.length > 0 && <AccordionAtom items={items} defaultValue={[instances[0].id]} multiple />}

      {!allTaken && (
        <PositionPickerPopover
          positions={POSITIONS}
          takenPositions={takenPositions}
          triggerLabel="Aggiungi nomi"
          onSelect={(v) => addInstance(v as NamePosition)}
        />
      )}
    </Flex>
  );
};

export { StepName };
