import { cva, type VariantProps } from 'class-variance-authority';

import {
  Popover,
  PopoverClose,
  type PopoverCloseProps,
  PopoverContent,
  type PopoverContentProps,
  PopoverPortal,
  type PopoverPortalProps,
  type PopoverProps,
  PopoverTrigger,
  type PopoverTriggerProps,
} from '@shared';
import { cn } from '@utils';

const popoverContentVariants = cva('z-50 rounded-xl border border-gray-30 shadow-lg outline-none', {
  variants: {
    variant: {
      default: 'bg-white',
      color_picker: 'flex items-center flex-col justify-center w-auto translate-x-full bg-white p-4 gap-4',
    },
    gap: {
      default: '',
      sm: 'flex flex-col gap-3',
      lg: 'flex flex-col gap-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    gap: 'default',
  },
});

type PopoverAtomContentProps = PopoverContentProps &
  VariantProps<typeof popoverContentVariants> & {
    className?: string;
  };

const PopoverAtomContent = ({ className, variant, gap, align = 'start', sideOffset = 8, ...props }: PopoverAtomContentProps) => {
  return (
    <PopoverPortal>
      <PopoverContent align={align} sideOffset={sideOffset} className={cn(popoverContentVariants({ variant, gap }), className)} {...props} />
    </PopoverPortal>
  );
};

export {
  Popover as PopoverAtom,
  PopoverClose as PopoverAtomClose,
  type PopoverCloseProps as PopoverAtomCloseProps,
  PopoverAtomContent,
  type PopoverAtomContentProps,
  type PopoverPortalProps as PopoverAtomPortalProps,
  type PopoverProps as PopoverAtomProps,
  PopoverTrigger as PopoverAtomTrigger,
  type PopoverTriggerProps as PopoverAtomTriggerProps,
};
