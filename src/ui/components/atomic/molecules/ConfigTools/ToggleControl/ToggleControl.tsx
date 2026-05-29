'use client';

import { Flex, Text } from '@atoms';

interface ToggleControlProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleControl = ({ label, value, onChange }: ToggleControlProps) => {
  return (
    <Flex className="justify-between items-center w-full">
      <Text variant="configurator_part_label">{label}</Text>
      <button
        onClick={() => onChange(!value)}
        className={['relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0', value ? 'bg-black' : 'bg-gray-300'].join(' ')}
      >
        <span
          className={['absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', value ? 'translate-x-5' : 'translate-x-0.5'].join(
            ' ',
          )}
        />
      </button>
    </Flex>
  );
};

export { ToggleControl };
