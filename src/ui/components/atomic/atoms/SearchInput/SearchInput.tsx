'use client';

import { cva, VariantProps } from 'class-variance-authority';

import { Input } from '@shared';
import { cn } from '@utils';

const variantSearchInput = cva('border-border', {
  variants: {
    variant: {
      default: cn(
        'text-[14px] border-none bg-white px-4 py-2 min-w-0',
        'w-0 data-[active=true]:w-full',
        'data-[active=false]:pointer-events-none data-[active=true]:pointer-events-auto data-[active=true]:cursor-text data-[active=true]:text-black',
        'data-[active=false]:ring-0',
      ),
    },
  },
});

interface SearchInputProps extends React.ComponentProps<'input'> {
  className?: string;
  variant?: VariantProps<typeof variantSearchInput>['variant'];
}

const SearchInput = ({ variant = 'default', className, ...props }: SearchInputProps) => {
  return <Input className={cn(variantSearchInput({ variant, className }))} {...props} />;
};

export { SearchInput };
