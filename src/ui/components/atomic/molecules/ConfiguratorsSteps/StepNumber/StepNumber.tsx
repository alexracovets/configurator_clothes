"use client";

import { useNumberStore } from "@store";
import { Flex, Text, Button } from "@atoms";
import { ColorTabControl, DeleteButton, FontSelectRow, RangeControl } from "@molecules";

const StepNumber = () => {
  const isVisible = useNumberStore(({ isVisible }) => isVisible);
  const setVisible = useNumberStore(({ setVisible }) => setVisible);
  const update = useNumberStore(({ update }) => update);
  const instance = useNumberStore(({ instance }) => instance);

  if (!instance && !isVisible) {
    return (
      <Flex variant="step_design">
        <Button variant="default" size="sm" className="w-full justify-center gap-2" onClick={() => setVisible(true)}>
          <span className="text-lg leading-none">+</span>
          Aggiungi numero
        </Button>
      </Flex>
    );
  }

  if (!instance) return null;

  return (
    <Flex variant="step_design">
      <FontSelectRow font={instance.font} onChange={(font) => update({ font })} />

      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Numero</Text>
        <input
          type="text"
          inputMode="numeric"
          value={instance.text}
          maxLength={2}
          onChange={(e) => { const digits = e.target.value.replace(/\D/g, ""); update({ text: digits }); }}
          className="w-full h-10 bg-white border border-input-border rounded-[8px] px-3 text-sm font-inter text-default outline-none focus:border-active transition-colors"
          placeholder="9"
        />
      </Flex>

      <ColorTabControl
        textColor={instance.textColor}
        strokeColor={instance.strokeColor}
        onTextColor={(textColor) => update({ textColor })}
        onStrokeColor={(strokeColor) => update({ strokeColor })}
      />

      <RangeControl label="Spessore contorno" value={instance.strokeWidth} onChange={(strokeWidth) => update({ strokeWidth })} min={0} max={20} unit="px" />
      <RangeControl label="Altezza e larghezza" value={instance.fontSize} onChange={(fontSize) => update({ fontSize })} min={24} max={120} unit="px" />

      <DeleteButton onClick={() => setVisible(false)} />
    </Flex>
  );
};

export { StepNumber };
