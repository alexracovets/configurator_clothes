'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@utils';
import type { ChildrenType } from '@types';

const variantText = cva('font-inter font-[400] leading-none', {
  variants: {
    variant: {
      default: '',
      whatsapp_badge: 'text-[14px] leading-[24px] text-white font-medium',
      product_name: 'text-[32px] leading-[1] font-[600] tracking-[-1px]',
      product_price: 'text-[32px] leading-[39px] font-semibold tracking-[-1px]',
      menu_step_buy: cn(
        'relative text-[22px] text-gray-10 leading-[27px] font-semibold uppercase overflow-hidden cursor-pointer',
        'data-[active=true]:text-default',
        'transition-all duration-300 ease-in-out',
      ),
      menu_step_buy_line: cn(
        'absolute bottom-0 left-0 h-[4px] pointer-events-none',
        'bg-linear-to-r from-[#ECD187] via-[#CC2967] to-[#030102]',
        'transition-[left,width] duration-300 ease-in-out',
      ),
      slider_label: cn('text-[14px] leading-[15px] text-gray', 'data-[thumb=true]:text-default data-[thumb=true]:absolute data-[thumb=true]:-translate-x-1/2'),
      configurator_part_label: cn(
        'text-[16px] leading-[16px] font-semibold text-gray-30 underline-gray-30',
        'group-aria-expanded/accordion-trigger:text-default',
        'transition-all duration-200 ease-in-out',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface TextProps extends ChildrenType {
  variant?: VariantProps<typeof variantText>['variant'];
  style?: React.CSSProperties;
  className?: string;
  asChild?: boolean;
}

const Text = ({ className, variant, asChild = false, children, ...props }: TextProps) => {
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp data-slot="text" className={cn(variantText({ variant, className }))} {...props}>
      {children}
    </Comp>
  );
};

export { Text };
