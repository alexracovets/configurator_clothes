'use client';

import { ColorTabControl, DeleteButton, FontSelectRow, RangeControl } from '@molecules';
import { Button, Flex, Text } from '@atoms';
import { useActiveNameInstance, useNameStore } from '@store';

const StepName = () => {
  const isVisible = useNameStore(({ isVisible }) => isVisible);
  const setVisible = useNameStore(({ setVisible }) => setVisible);
  const updateActive = useNameStore(({ updateActive }) => updateActive);
  const active = useActiveNameInstance();

  if (!active && !isVisible) {
    return (
      <Flex variant="step_design">
        <Button variant="default" size="sm" className="w-full justify-center gap-2" onClick={() => setVisible(true)}>
          <span className="text-lg leading-none">+</span>
          Aggiungi nomi
        </Button>
      </Flex>
    );
  }

  if (!active) return null;

  return (
    <Flex variant="step_design">
      <FontSelectRow font={active.font} onChange={(font) => updateActive({ font })} />

      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Testo</Text>
        <input
          type="text"
          value={active.text}
          maxLength={20}
          onChange={(e) => updateActive({ text: e.target.value })}
          className="w-full h-10 bg-white border border-input-border rounded-[8px] px-3 text-sm font-inter text-default outline-none focus:border-active transition-colors"
          placeholder="PLAYER NAME"
        />
      </Flex>

      <ColorTabControl
        textColor={active.textColor}
        strokeColor={active.strokeColor}
        onTextColor={(textColor) => updateActive({ textColor })}
        onStrokeColor={(strokeColor) => updateActive({ strokeColor })}
      />

      <RangeControl label="Spessore contorno" value={active.strokeWidth} onChange={(strokeWidth) => updateActive({ strokeWidth })} min={0} max={20} unit="px" />
      <RangeControl label="Altezza e larghezza" value={active.fontSize} onChange={(fontSize) => updateActive({ fontSize })} min={24} max={120} unit="px" />

      <DeleteButton onClick={() => setVisible(false)} />
    </Flex>
  );
};

export { StepName };
