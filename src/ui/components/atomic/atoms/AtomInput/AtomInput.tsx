import { Input as InputPrimitive } from '@base-ui/react/input';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@utils';

const inputVariants = cva(
  cn(
    'w-full min-w-0 outline-none transition-all duration-200 ease-in',
    'placeholder:text-gray-30',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-active focus-visible:border-active',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-1',
  ),
  {
    variants: {
      variant: {
        default: 'border border-input-border rounded-full bg-transparent',
        ghost: 'border border-transparent bg-transparent',
        filled: 'border border-input-border rounded-full bg-primary',
        color_picker: 'max-w-[80px] min-w-auto border border-gray-30 rounded-full bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] pr-1',
      },
      size: {
        default: '',
        sm: 'h-7 px-3 py-1 text-xs',
        lg: 'h-11 px-5 py-3 text-base',
        color_picker: 'pl-3 pr-1 text-[12px] h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type AtomInputProps = Omit<InputPrimitive.Props, 'size'> & VariantProps<typeof inputVariants>;

const AtomInput = ({ className, variant, size, ...props }: AtomInputProps) => {
  return <InputPrimitive data-slot="input" className={cn(inputVariants({ variant, size }), className)} {...props} />;
};

export { AtomInput, inputVariants };
