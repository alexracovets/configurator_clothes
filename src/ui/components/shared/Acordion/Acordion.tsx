import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';

import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@utils';

const Accordion = ({ className, ...props }: AccordionPrimitive.Root.Props) => {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn('flex w-full flex-col', className)} {...props} />;
};

const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('group/accordion-item', className)} {...props} />;
};

const AccordionTrigger = ({ className, children, ...props }: AccordionPrimitive.Trigger.Props) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger flex flex-1 items-center justify-between cursor-pointer outline-none',
          'rounded-lg border border-transparent',
          'aria-disabled:pointer-events-none aria-disabled:opacity-50',
          'outline-none transition-all',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="ml-auto mr-[8px] size-4 shrink-0 text-base-black transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};

const AccordionContent = ({ className, children, ...props }: AccordionPrimitive.Panel.Props) => {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="grid data-open:animate-accordion-grid-down data-closed:animate-accordion-grid-up data-open:grid-rows-[1fr] data-closed:grid-rows-[0fr]"
      {...props}
    >
      <div className={cn('overflow-hidden', className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
