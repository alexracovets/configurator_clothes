"use client";

import { useState } from "react";
import { useGradientStore, useColorStore, SHIRT_PARTS } from "@store";
import type { ShirtPart } from "@store";
import { Flex, Text } from "@atoms";
import { cn } from "@utils";
import { ColorSwatches } from "../ColorSwatches";

const PART_LABELS: Record<ShirtPart, string> = {
  front: "Davanti",
  back: "Retro",
  sleeve_left: "Manica 1",
  sleeve_right: "Manica 2",
  collar: "Colletto",
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}

function RangeSlider({ label, value, min, max, unit, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Flex className="justify-between items-center w-full">
        <Text className="text-xs font-medium text-gray-600">{label}</Text>
        <Text className="text-xs text-gray-400">{value}{unit}</Text>
      </Flex>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-black"
      />
    </div>
  );
}

const StepSfumatura = () => {
  const { partGradients, setPartGradient } = useGradientStore();
  const { partColors } = useColorStore();
  const [openPart, setOpenPart] = useState<ShirtPart | null>("front");

  return (
    <Flex variant="step_design">
      {SHIRT_PARTS.map(({ key }) => {
        const isOpen = openPart === key;
        const gradient = partGradients[key];
        const color1 = partColors[key];

        const previewGrad = gradient.enabled
          ? `linear-gradient(${gradient.rotation}deg, ${color1} ${gradient.position}%, ${gradient.color2})`
          : color1;

        return (
          <div key={key} className="w-full border border-gray-200 rounded-[10px] overflow-hidden">
            <button
              onClick={() => setOpenPart(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Flex className="gap-3 items-center">
                <div
                  className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                  style={{ background: previewGrad }}
                />
                <Text className="text-sm font-medium text-gray-800">{PART_LABELS[key]}</Text>
                {gradient.enabled && (
                  <Text className="text-xs text-gray-400">sfumatura attiva</Text>
                )}
              </Flex>
              <span className={cn("text-gray-400 text-lg transition-transform", isOpen && "rotate-45")}>
                +
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2 flex flex-col gap-4">
                <Flex className="justify-between items-center w-full">
                  <Text className="text-sm font-medium text-gray-700">Sfumatura</Text>
                  <button
                    onClick={() => setPartGradient(key, { enabled: !gradient.enabled })}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0",
                      gradient.enabled ? "bg-black" : "bg-gray-300",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                        gradient.enabled ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </Flex>

                {gradient.enabled && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Text className="text-sm font-medium text-gray-700">Colore 1 (dal colore sezione)</Text>
                      <div
                        className="w-[60px] h-[60px] rounded-[8px] border border-gray-200"
                        style={{ backgroundColor: color1 }}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Text className="text-sm font-medium text-gray-700">Colore 2</Text>
                      <ColorSwatches
                        activeColor={gradient.color2}
                        onSelect={(color) => setPartGradient(key, { color2: color })}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <RangeSlider
                        label="Rotazione"
                        value={gradient.rotation}
                        min={0}
                        max={360}
                        unit="°"
                        onChange={(v) => setPartGradient(key, { rotation: v })}
                      />
                      <RangeSlider
                        label="Posizione linea"
                        value={gradient.position}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(v) => setPartGradient(key, { position: v })}
                      />
                      <RangeSlider
                        label="Morbidezza"
                        value={gradient.softness}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(v) => setPartGradient(key, { softness: v })}
                      />
                      <RangeSlider
                        label="Trasparenza"
                        value={gradient.opacity}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(v) => setPartGradient(key, { opacity: v })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </Flex>
  );
};

export { StepSfumatura };
