"use client";

import { useNameStore, FONTS } from "@store";
import { Flex, Text, Button } from "@atoms";
import { ColorControl, RangeControl } from "@molecules";

const FONT_OPTIONS = FONTS.map((f) => ({ label: f.label, value: f.value }));

const StepName = () => {
  const {
    isVisible,
    text,
    font,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    setVisible,
    setText,
    setFont,
    setFontSize,
    setTextColor,
    setStrokeColor,
    setStrokeWidth,
  } = useNameStore();

  const activeFont = FONT_OPTIONS.find((f) => f.value === font) ?? FONT_OPTIONS[0];

  return (
    <Flex variant="step_design">
      {!isVisible ? (
        <Button
          variant="default"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={() => setVisible(true)}
        >
          <span className="text-lg leading-none">+</span>
          Aggiungi nomi
        </Button>
      ) : (
        <>
          {/* Font selector */}
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
                  onClick={() => setFont(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </Flex>

          {/* Text input */}
          <Flex variant="configurator_part">
            <Text variant="configurator_part_label">Testo</Text>
            <input
              type="text"
              value={text}
              maxLength={20}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-sm font-inter outline-none focus:border-active transition-colors"
              style={{ fontFamily: font }}
              placeholder="PLAYER NAME"
            />
          </Flex>

          {/* Font size */}
          <RangeControl
            label="Altezza e larghezza"
            value={fontSize}
            onChange={setFontSize}
            min={24}
            max={120}
            unit="px"
          />

          {/* Text color */}
          <ColorControl
            activeColor={textColor}
            onSelect={setTextColor}
            label="Colore testo"
          />

          {/* Stroke color */}
          <ColorControl
            activeColor={strokeColor}
            onSelect={setStrokeColor}
            label="Colore contorno"
          />

          {/* Stroke width */}
          <RangeControl
            label="Spessore contorno"
            value={strokeWidth}
            onChange={setStrokeWidth}
            min={0}
            max={20}
            unit="px"
          />

          {/* Remove button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors"
            onClick={() => setVisible(false)}
          >
            Rimuovi nome
          </Button>
        </>
      )}
    </Flex>
  );
};

export { StepName };
