'use client';

import { useEffect, useRef, useState } from 'react';

import { Flex, Range, Text } from '@atoms';
import { setDesignInteracting } from '@hooks';

interface RangeControlProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

const RangeControl = ({ label, value, onChange, min = 0, max = 100, unit = '' }: RangeControlProps) => {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const clamp = (v: number) => Math.min(Math.max(v, safeMin), safeMax);

  const [localValue, setLocalValue] = useState(() => clamp(value));
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) setLocalValue(clamp(value));
  }, [value]);

  const percent = ((localValue - safeMin) / (safeMax - safeMin)) * 100;
  const hideMin = percent < 12;
  const hideMax = percent > 83;

  const handleChange = (values: number | readonly number[]) => {
    const next = clamp(([] as number[]).concat(values as number[])[0]);
    if (!isDragging.current) {
      isDragging.current = true;
      setDesignInteracting(true);
      const commit = () => {
        isDragging.current = false;
        setDesignInteracting(false);
        window.removeEventListener('pointerup', commit);
      };
      window.addEventListener('pointerup', commit);
    }
    setLocalValue(next);
    onChange(next);
  };

  return (
    <Flex variant="configurator_part" className="overflow-hidden">
      {label && <Text variant="configurator_part_label">{label}</Text>}
      <Range value={[localValue]} onValueChange={handleChange} min={safeMin} max={safeMax} variant="default" />
      <Flex variant="slider_labels">
        <Text variant="slider_label" style={{ opacity: hideMin ? 0 : 1, transition: 'opacity 0.15s' }}>
          {safeMin}
          {unit}
        </Text>
        <Text
          variant="slider_label"
          data-thumb={true}
          style={{
            left: `clamp(0%, ${percent}%, 100%)`,
            translate: percent < 5 ? '0' : percent > 95 ? '-100%' : '-50% 0',
          }}
        >
          {localValue}
          {unit}
        </Text>
        <Text variant="slider_label" style={{ opacity: hideMax ? 0 : 1, transition: 'opacity 0.15s' }}>
          {safeMax}
          {unit}
        </Text>
      </Flex>
    </Flex>
  );
};

export { RangeControl };
