'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@shared';
import { cn } from '@utils';
import type { AcordionItem } from '@types';

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionTriggerVariants = cva('', {
  variants: {
    variant: {
      default: cn('py-3 color-gray-30', 'transition-all duration-200 ease-in-out'),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionContentVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: '',
      ghost: 'px-2',
      filled: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface AcordionAtomProps extends VariantProps<typeof accordionItemVariants> {
  items: AcordionItem[];
  className?: string;
  defaultValue?: string[];
  multiple?: boolean;
}

const AcordionAtom = ({ items, variant = 'default', className, defaultValue, multiple = false }: AcordionAtomProps) => {
  return (
    <Accordion className={cn(className)} multiple={multiple} defaultValue={defaultValue}>
      {items.map(({ value, trigger, content }) => (
        <AccordionItem key={value} value={value} className={accordionItemVariants({ variant })}>
          <AccordionTrigger className={cn(accordionTriggerVariants({ variant }))}>{trigger}</AccordionTrigger>
          <AccordionContent className={accordionContentVariants({ variant })}>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export { AcordionAtom };
