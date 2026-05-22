"use client";

import { useGradientStore, useColorStore, SHIRT_PARTS } from "@store";
import type { ShirtPart } from "@store";
import { Flex, Text, AcordionAtom } from "@atoms";
import { ColorControl, RangeControl, ToggleControl } from "@molecules";

const PART_LABELS: Record<ShirtPart, string> = {
  front: "Davanti",
  back: "Retro",
  sleeve_left: "Manica 1",
  sleeve_right: "Manica 2",
  collar: "Colletto",
};

const StepSfumatura = () => {
  const { partGradients, setPartGradient } = useGradientStore();
  const { partColors } = useColorStore();

  const items = SHIRT_PARTS.map(({ key }) => {
    const gradient = partGradients[key];
    const color1 = partColors[key];

    const previewGrad = gradient.enabled
      ? `linear-gradient(${gradient.rotation}deg, ${color1} ${gradient.position}%, ${gradient.color2})`
      : color1;

    return {
      value: key,
      trigger: (
        <Flex className="gap-3 items-center">
          <div
            className="w-5 h-5 rounded-[4px] border border-gray-200 shrink-0"
            style={{ background: previewGrad }}
          />
          <Text className="text-sm font-medium text-gray-800">
            {PART_LABELS[key]}
          </Text>
          {gradient.enabled && (
            <Text className="text-[14px] leading-[15px] text-gray-400">
              sfumatura attiva
            </Text>
          )}
        </Flex>
      ),
      content: (
        <Flex variant="configurator_part" className="gap-7">
          <ToggleControl
            label="Sfumatura"
            value={gradient.enabled}
            onChange={(enabled) => setPartGradient(key, { enabled })}
          />

          {gradient.enabled && (
            <>
              <Flex variant="configurator_part">
                <Text variant="configurator_part_label">
                  Colore 1 (dal colore sezione)
                </Text>
                <div
                  className="w-[60px] h-[60px] rounded-[8px] border border-gray-200"
                  style={{ backgroundColor: color1 }}
                />
              </Flex>

              <ColorControl
                label="Colore 2"
                activeColor={gradient.color2}
                onSelect={(color) => setPartGradient(key, { color2: color })}
              />

              <RangeControl
                label="Rotazione"
                value={gradient.rotation}
                onChange={(v) => setPartGradient(key, { rotation: v })}
                min={0}
                max={360}
                unit="°"
              />
              <RangeControl
                label="Posizione linea"
                value={gradient.position}
                onChange={(v) => setPartGradient(key, { position: v })}
                unit="%"
              />
              <RangeControl
                label="Morbidezza"
                value={gradient.softness}
                onChange={(v) => setPartGradient(key, { softness: v })}
                unit="%"
              />
              <RangeControl
                label="Trasparenza"
                value={gradient.opacity}
                onChange={(v) => setPartGradient(key, { opacity: v })}
                unit="%"
              />
            </>
          )}
        </Flex>
      ),
    };
  });

  return (
    <Flex variant="step_design">
      <AcordionAtom items={items} defaultValue={["front"]} />
    </Flex>
  );
};

export { StepSfumatura };
