'use client';

import * as React from 'react';

import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@utils';

interface InputProps extends React.ComponentProps<'input'> {
  className?: string;
  type?: string;
}

const Input = ({ className, type, ...props }: InputProps) => {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 border border-border rounded-full ring-border outline-none',
        'placeholder:text-placeholder',
        'focus-visible:ring-1',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-1',
        'transition-all duration-300 ease-in',
        className,
      )}
      {...props}
    />
  );
};

export { Input };
