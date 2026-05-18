"use client";

import { usePatternStore, PATTERNS } from "@store";
import { Flex, Text, AtomImage, Button } from "@atoms";
import { cn } from "@utils";

const StepDesign = () => {
  const { partPatterns, patternOpacity, setPatternForAll, setPatternOpacity } =
    usePatternStore();

  const activePatterUrl = partPatterns.front;

  return (
    <Flex variant="step_design">
      <div className="grid grid-cols-5 gap-2 w-full">
        {PATTERNS.map((pattern) => {
          const isActive = activePatterUrl === pattern.url;
          return (
            <Button
              key={pattern.id}
              onClick={() => setPatternForAll(pattern.url)}
              title={pattern.label}
              className="w-full overflow-hidden rounded-[8px] p-0"
            >
              {pattern.url ? (
                <AtomImage
                  src={pattern.url}
                  alt={pattern.label}
                  variant="steps"
                  data-active={isActive}
                />
              ) : (
                <Flex
                  className={cn(
                    "w-full h-[80px] flex-col gap-1 items-center justify-center",
                    "border-2 rounded-[8px]",
                    isActive ? "border-black" : "border-transparent",
                    "bg-gray-100",
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                    <circle cx="10" cy="10" r="8" />
                    <line x1="4" y1="4" x2="16" y2="16" />
                  </svg>
                  <Text className="text-[10px] text-gray-400 leading-none">Nessuno</Text>
                </Flex>
              )}
            </Button>
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
