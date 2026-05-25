"use client";

import { useState } from "react";

import { useNameStore, useActiveNameInstance, FONTS, fontCssFamily } from "@store";
import { Flex, Text, Button, AtomSelect, SvgIcon } from "@atoms";
import { ColorControl, RangeControl } from "@molecules";
import { cn } from "@utils";

type ColorTab = "colori" | "contorno";

const COLOR_TABS: { id: ColorTab; label: string }[] = [
  { id: "colori", label: "Colori" },
  { id: "contorno", label: "Contorno" },
];

const StepName = () => {
  const isVisible = useNameStore(({ isVisible }) => isVisible);
  const setVisible = useNameStore(({ setVisible }) => setVisible);
  const updateActive = useNameStore(({ updateActive }) => updateActive);
  const active = useActiveNameInstance();

  const [colorTab, setColorTab] = useState<ColorTab>("colori");

  const activeFont = FONTS.find(({ value }) => value === active?.font) ?? FONTS[0];

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
        <AtomSelect
          variant="font"
          options={FONTS.map((f) => ({ label: f.label, value: f.value, fontFamily: fontCssFamily(f.value) }))}
          value={{ label: activeFont.label, value: activeFont.value, fontFamily: fontCssFamily(activeFont.value) }}
          onChange={({ value }) => updateActive({ font: value })}
          icon
        />
      </Flex>

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

      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Colore</Text>
        <div className="flex w-full border-b border-gray-200">
          {COLOR_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setColorTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-inter font-medium",
                "border-b-2 -mb-px transition-colors duration-200 cursor-pointer",
                colorTab === id
                  ? "border-default text-default"
                  : "border-transparent text-gray hover:text-default",
              )}
            >
              <SvgIcon name={id} />
              {label}
            </button>
          ))}
        </div>

        {colorTab === "colori" && (
          <ColorControl
            activeColor={active.textColor}
            onSelect={(textColor) => updateActive({ textColor })}
          />
        )}

        {colorTab === "contorno" && (
          <ColorControl
            activeColor={active.strokeColor}
            onSelect={(strokeColor) => updateActive({ strokeColor })}
          />
        )}
      </Flex>

      <RangeControl
        label="Spessore contorno"
        value={active.strokeWidth}
        onChange={(strokeWidth) => updateActive({ strokeWidth })}
        min={0}
        max={20}
        unit="px"
      />

      <RangeControl
        label="Altezza e larghezza"
        value={active.fontSize}
        onChange={(fontSize) => updateActive({ fontSize })}
        min={24}
        max={120}
        unit="px"
      />

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center gap-2 text-red-500 border-red-200 hover:border-red-400 hover:bg-red-50 transition-colors"
        onClick={() => setVisible(false)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Eliminare
      </Button>
    </Flex>
  );
};

export { StepName };
