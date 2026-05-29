'use client';

import { cva, VariantProps } from 'class-variance-authority';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared';

const variantTrigger = cva('font-inter', {
  variants: {
    variant: {
      default: '',
      leng_switcher: 'text-[14px] px-4 py-1.5 rounded-full border border-border',
      font: 'w-full h-10 justify-between border border-input-border rounded-[8px] px-3 text-sm bg-white text-default',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const variantContent = cva('', {
  variants: {
    variant: {
      default: '',
      leng_switcher: 'text-[14px] border border-border',
      font: 'border border-gray-200 rounded-[8px] shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface AtomSelectOption {
  label: string;
  value: string;
  fontFamily?: string;
}

interface AtomSelectProps extends React.ComponentProps<typeof Select> {
  options: AtomSelectOption[];
  value: AtomSelectOption;
  onChange: (value: AtomSelectOption) => void;
  icon?: boolean;
  variant?: VariantProps<typeof variantTrigger>['variant'];
}

const AtomSelect = ({ options, value, onChange, variant = 'default', icon = false }: AtomSelectProps) => {
  const isFont = variant === 'font';

  return (
    <Select
      value={value.value}
      onValueChange={(val) => {
        if (val == null) return;
        onChange(options.find((o) => o.value === val) ?? { label: '', value: val });
      }}
    >
      <SelectTrigger className={variantTrigger({ variant })} icon={icon}>
        <SelectValue>
          <span style={value.fontFamily ? { fontFamily: value.fontFamily } : undefined}>{value.label}</span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent className={variantContent({ variant })} side="bottom" align="start" alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={isFont ? 'px-3 py-2.5' : ''}
            style={option.fontFamily ? { fontFamily: option.fontFamily } : undefined}
          >
            <span className={isFont ? 'uppercase tracking-wide text-sm text-default' : ''}>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { AtomSelect };
