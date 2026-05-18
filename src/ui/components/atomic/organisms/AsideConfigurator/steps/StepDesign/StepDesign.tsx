"use client";

import { usePatternStore, PATTERNS } from "@store";
import { Flex, Text } from "@atoms";

const StepDesign = () => {
  const { partPatterns, patternOpacity, setPatternForAll, setPatternOpacity } =
    usePatternStore();

  const activePatterUrl = partPatterns.front;

  return (
    <Flex className="flex-col gap-4 w-full pt-3">
      <div className="grid grid-cols-3 gap-2">
        {PATTERNS.map((pattern) => {
          const isActive = activePatterUrl === pattern.url;
          return (
            <button
              key={pattern.id}
              onClick={() => setPatternForAll(pattern.url)}
              className={`
                relative aspect-square rounded border-2 overflow-hidden bg-[#e5e7eb] transition-colors
                ${isActive ? "border-black" : "border-transparent hover:border-gray-400"}
              `}
              title={pattern.label}
            >
              {pattern.url ? (
                <img
                  src={pattern.url}
                  alt={pattern.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Flex className="w-full h-full items-center justify-center">
                  <Text className="text-xs text-gray-500">Nessuno</Text>
                </Flex>
              )}
            </button>
          );
        })}
      </div>

      {activePatterUrl && (
        <Flex className="flex-col gap-2 w-full">
          <Text className="text-sm font-medium text-gray-700">Trasparenza</Text>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(patternOpacity * 100)}
            onChange={(e) => setPatternOpacity(Number(e.target.value) / 100)}
            className="w-full accent-black"
          />
          <Flex className="justify-between">
            <Text className="text-xs text-gray-400">0%</Text>
            <Text className="text-xs text-gray-400">100%</Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export { StepDesign };
