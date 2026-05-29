'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared';
import { cn } from '@utils';
import { FONTS } from '@constants';

type FontOption = (typeof FONTS)[number];

interface FontSelectProps {
  options: FontOption[];
  value: FontOption;
  onChange: (font: FontOption) => void;
}

const FontSelect = ({ options, value, onChange }: FontSelectProps) => {
  return (
    <Select
      value={value.value}
      onValueChange={(val) => {
        const found = options.find((o) => o.value === val);
        if (found) onChange(found);
      }}
    >
      <SelectTrigger
        className={cn('w-full justify-between', 'border border-gray-200 rounded-[8px] px-4 py-3', 'text-sm font-inter text-default bg-white')}
        icon
      >
        <SelectValue>
          <span style={{ fontFamily: value.value }} className="uppercase tracking-wide">
            {value.label}
          </span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="bg-white border border-gray-200 rounded-[8px] shadow-lg" side="bottom" align="start" alignItemWithTrigger={true}>
        {options.map((font) => (
          <SelectItem key={font.value} value={font.value} className="px-4 py-3 bg-white hover:bg-gray-50" style={{ fontFamily: font.value }}>
            <span className="uppercase tracking-wide text-sm text-default">{font.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { FontSelect };
