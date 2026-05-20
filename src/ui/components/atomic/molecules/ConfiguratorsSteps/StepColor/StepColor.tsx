"use client";

import { useState } from "react";
import { useColorStore, SHIRT_PARTS } from "@store";
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

const StepColor = () => {
  const { partColors, setPartColor } = useColorStore();
  const [openPart, setOpenPart] = useState<ShirtPart | null>("front");

  return (
    <Flex variant="step_design">
      {SHIRT_PARTS.map(({ key }) => {
        const isOpen = openPart === key;
        return (
          <div key={key} className="w-full border border-gray-200 rounded-[10px] overflow-hidden">
            <button
              onClick={() => setOpenPart(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Flex className="gap-3 items-center">
                <div
                  className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: partColors[key] }}
                />
                <Text className="text-sm font-medium text-gray-800">{PART_LABELS[key]}</Text>
              </Flex>
              <span className={cn("text-gray-400 text-lg transition-transform", isOpen && "rotate-45")}>
                +
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2">
                <ColorSwatches
                  activeColor={partColors[key]}
                  onSelect={(color) => setPartColor(key, color)}
                />
              </div>
            )}
          </div>
        );
      })}
    </Flex>
  );
};

export { StepColor };
