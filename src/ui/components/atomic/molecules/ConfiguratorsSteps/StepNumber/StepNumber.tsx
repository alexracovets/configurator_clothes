"use client";

import { useState } from "react";

import { useNumberStore, FONTS, fontCssFamily } from "@store";
import { Flex, Text, Button, AtomSelect, SvgIcon } from "@atoms";
import { ColorControl, RangeControl } from "@molecules";
import { cn } from "@utils";

type ColorTab = "colori" | "contorno";

const COLOR_TABS: { id: ColorTab; label: string }[] = [
  { id: "colori", label: "Colori" },
  { id: "contorno", label: "Contorno" },
];

const StepNumber = () => {
  const isVisible = useNumberStore(({ isVisible }) => isVisible);
  const setVisible = useNumberStore(({ setVisible }) => setVisible);
  const update = useNumberStore(({ update }) => update);
  const instance = useNumberStore(({ instance }) => instance);

  const [colorTab, setColorTab] = useState<ColorTab>("colori");

  const activeFont = FONTS.find(({ value }) => value === instance?.font) ?? FONTS[0];

  if (!instance && !isVisible) {
    return (
      <Flex variant="step_design">
        <Button
          variant="default"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={() => setVisible(true)}
        >
          <span className="text-lg leading-none">+</span>
          Aggiungi numero
        </Button>
      </Flex>
    );
  }

  if (!instance) return null;

  return (
    <Flex variant="step_design">
      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Carattere</Text>
        <AtomSelect
          variant="font"
          options={FONTS.map((f) => ({ label: f.label, value: f.value, fontFamily: fontCssFamily(f.value) }))}
          value={{ label: activeFont.label, value: activeFont.value, fontFamily: fontCssFamily(activeFont.value) }}
          onChange={({ value }) => update({ font: value })}
          icon
        />
      </Flex>

      <Flex variant="configurator_part">
        <Text variant="configurator_part_label">Numero</Text>
        <input
          type="text"
          inputMode="numeric"
          value={instance.text}
          maxLength={2}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            update({ text: digits });
          }}
          className="w-full h-10 bg-white border border-input-border rounded-[8px] px-3 text-sm font-inter text-default outline-none focus:border-active transition-colors"
          placeholder="9"
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
            activeColor={instance.textColor}
            onSelect={(textColor) => update({ textColor })}
          />
        )}

        {colorTab === "contorno" && (
          <ColorControl
            activeColor={instance.strokeColor}
            onSelect={(strokeColor) => update({ strokeColor })}
          />
        )}
      </Flex>

      <RangeControl
        label="Spessore contorno"
        value={instance.strokeWidth}
        onChange={(strokeWidth) => update({ strokeWidth })}
        min={0}
        max={20}
        unit="px"
      />

      <RangeControl
        label="Altezza e larghezza"
        value={instance.fontSize}
        onChange={(fontSize) => update({ fontSize })}
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

export { StepNumber };
