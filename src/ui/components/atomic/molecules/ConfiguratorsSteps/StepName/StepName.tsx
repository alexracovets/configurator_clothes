"use client";

import { useNameStore, useActiveNameInstance, FONTS } from "@store";
import { Flex, Text, Button } from "@atoms";
import { ColorControl, RangeControl } from "@molecules";

const FONT_OPTIONS = FONTS.map((f) => ({ label: f.label, value: f.value }));

const StepName = () => {
  const isVisible = useNameStore(({ isVisible }) => isVisible);
  const setVisible = useNameStore(({ setVisible }) => setVisible);
  const updateActive = useNameStore(({ updateActive }) => updateActive);
  const active = useActiveNameInstance();

  const activeFont =
    FONT_OPTIONS.find((f) => f.value === active?.font) ?? FONT_OPTIONS[0];

  if (!active && !isVisible) {
    return (
      <Flex variant="step_design">
        <Button
          variant="default"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={() => setVisible(true)}
        >
          <span className="text-lg leading-none">+</span>
          Aggiungi nomi
        </Button>
      </Flex>
    );
  }

  if (!active) return null;

  return (
    <Flex variant="step_design">
      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Carattere</Text>
        <div className="flex flex-wrap gap-2 w-full">
          {FONT_OPTIONS.map((f) => (
            <Button
              key={f.value}
              variant="select_part_short"
              className="flex-1 min-w-[48px] text-xs font-semibold"
              style={{ fontFamily: f.value }}
              data-active={activeFont.value === f.value}
              onClick={() => updateActive({ font: f.value })}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Flex>

      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Testo</Text>
        <input
          type="text"
          value={active.text}
          maxLength={20}
          onChange={(e) => updateActive({ text: e.target.value })}
          className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-sm font-inter outline-none focus:border-active transition-colors"
          style={{ fontFamily: active.font }}
          placeholder="PLAYER NAME"
        />
      </Flex>

      <RangeControl
        label="Altezza e larghezza"
        value={active.fontSize}
        onChange={(fontSize) => updateActive({ fontSize })}
        min={24}
        max={120}
        unit="px"
      />

      <ColorControl
        activeColor={active.textColor}
        onSelect={(textColor) => updateActive({ textColor })}
        label="Colore testo"
      />

      <ColorControl
        activeColor={active.strokeColor}
        onSelect={(strokeColor) => updateActive({ strokeColor })}
        label="Colore contorno"
      />

      <RangeControl
        label="Spessore contorno"
        value={active.strokeWidth}
        onChange={(strokeWidth) => updateActive({ strokeWidth })}
        min={0}
        max={20}
        unit="px"
      />

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors"
        onClick={() => setVisible(false)}
      >
        Rimuovi nome
      </Button>
    </Flex>
  );
};

export { StepName };
