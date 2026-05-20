"use client";

import { useRef } from "react";
import { cn } from "@utils";

export const COLORS = [
  "#C0392B", "#2980B9", "#F1C40F", "#F9FF00", "#1A2744",
  "#111111", "#FFFFFF", "#C8A96E", "#7D3C98", "#27AE60",
  "#E74C3C", "#FF00FF", "#1ABC9C", "#6E2C00", "#145A32",
];

interface ColorSwatchesProps {
  activeColor: string;
  onSelect: (color: string) => void;
}

export function ColorSwatches({ activeColor, onSelect }: ColorSwatchesProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap gap-2 w-full">
      {COLORS.map((color) => {
        const isActive = activeColor === color;
        return (
          <button
            key={color}
            onClick={() => onSelect(color)}
            title={color}
            style={{ backgroundColor: color }}
            className={cn(
              "w-[60px] h-[60px] rounded-[8px] border-2 cursor-pointer transition-all shrink-0",
              isActive ? "border-black scale-105" : "border-transparent",
              color === "#FFFFFF" && !isActive && "border-gray-200",
            )}
          />
        );
      })}
      <button
        onClick={() => inputRef.current?.click()}
        title="Colore personalizzato"
        style={
          !COLORS.includes(activeColor)
            ? { backgroundColor: activeColor }
            : {}
        }
        className={cn(
          "w-[60px] h-[60px] rounded-[8px] border-2 cursor-pointer transition-all shrink-0",
          "flex items-center justify-center bg-gray-100",
          !COLORS.includes(activeColor)
            ? "border-black scale-105"
            : "border-dashed border-gray-300",
        )}
      >
        {COLORS.includes(activeColor) && (
          <span className="text-gray-400 text-2xl leading-none">+</span>
        )}
        <input
          ref={inputRef}
          type="color"
          value={activeColor}
          onChange={(e) => onSelect(e.target.value)}
          className="sr-only"
        />
      </button>
    </div>
  );
}
