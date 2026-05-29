import { Button as ButtonPrimitive } from '@base-ui/react/button';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@utils';

const buttonVariants = cva(
  cn(
    'cursor-pointer group/button inline-flex shrink-0 whitespace-nowrap',
    'border border-transparent',
    'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-active',
    'active:not-aria-[haspopup]:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-red aria-invalid:ring-1 aria-invalid:ring-active',
    'transition-all duration-200 ease-in',
  ),
  {
    variants: {
      variant: {
        default: 'flex items-center justify-center font-semibold bg-primary-button hover:bg-primary-button/80',
        outline: '',
        secondary: '',
        ghost: 'bg-white ',
        select_part: cn(
          'w-full h-[80px] rounded-[8px] border-[2px] border-gray-200 shadow-sm',
          'data-[active=true]:border-active hover:border-active data-[active=true]:shadow-md hover:shadow-md',
          'transition-all duration-200 ease-in',
        ),
        select_part_short: cn(
          'w-full h-[60px] rounded-[8px] border-[2px] border-gray-200 shadow-sm',
          'data-[active=true]:border-active hover:border-active data-[active=true]:shadow-md hover:shadow-md',
          'transition-all duration-200 ease-in',
        ),
        select_none: cn(
          'text-[11px] color-default rounded-[8px]',
          'flex flex-col items-center justify-center w-full h-[80px] gap-1',
          'bg-gray-100 border-[2px] border-gray-200',
          'data-[active=true]:border-active hover:border-active',
          'transition-all duration-200 ease-in',
        ),
        destructive: '',
        link: '',
      },
      size: {
        default: '',
        xs: '',
        sm: 'py-3 px-4 text-4 leading-4 rounded-[8px] gap-2',
        lg: '',
        icon: 'p-1 rounded-sm',
        'icon-xs': '',
        'icon-sm': '',
        'icon-lg': '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = ({ className, variant = 'default', size = 'default', ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export { Button, buttonVariants };
