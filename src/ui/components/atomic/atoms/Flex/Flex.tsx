'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@utils';
import type { ChildrenType } from '@types';

const variantFlex = cva('flex w-fit items-center justify-center', {
  variants: {
    variant: {
      default: '',
      utility_bar: 'gap-5',
      search_bar: cn(
        'relative rounded-full w-full h-full justify-start overflow-hidden border border-transparent bg-white outline-none',
        'data-[active=true]:border-border',
      ),
      user_bar: 'justify-end gap-3 w-full',
      step_design: 'flex-col gap-7 w-full',
      aside_configurator_content: 'flex-col gap-7 w-full py-6 min-h-0 overflow-x-hidden',
      configurator_part: 'flex flex-col items-start justify-start gap-3 w-full pb-3',
      slider_labels: 'relative w-full flex justify-between',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface FlexProps extends ChildrenType {
  variant?: VariantProps<typeof variantFlex>['variant'];
  style?: React.CSSProperties;
  className?: string;
  asChild?: boolean;
}

const Flex = ({ variant = 'default', asChild = false, className, children, style, ...props }: FlexProps) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component className={cn(variantFlex({ variant, className }))} {...props} style={style}>
      {children}
    </Component>
  );
};

export { Flex };
