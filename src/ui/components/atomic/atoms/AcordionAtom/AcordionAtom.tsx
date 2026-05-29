"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@shared";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@utils";

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      default: "border-b border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionTriggerVariants = cva("", {
  variants: {
    variant: {
      default: "hover:bg-gray-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionContentVariants = cva("", {
  variants: {
    variant: {
      default: "",
      bordered: "",
      ghost: "px-2",
      filled: "text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

import type { AcordionItem } from "@types";

interface AcordionAtomProps extends VariantProps<typeof accordionItemVariants> {
  items: AcordionItem[];
  className?: string;
  defaultValue?: string[];
  multiple?: boolean;
}

const AcordionAtom = ({
  items,
  variant = "default",
  className,
  defaultValue,
  multiple = false,
}: AcordionAtomProps) => {
  return (
    <Accordion
      className={cn(className)}
      multiple={multiple}
      defaultValue={defaultValue}
    >
      {items.map(({ value, trigger, content }) => (
        <AccordionItem
          key={value}
          value={value}
          className={accordionItemVariants({ variant })}
        >
          <AccordionTrigger
            className={cn(accordionTriggerVariants({ variant }))}
          >
            {trigger}
          </AccordionTrigger>
          <AccordionContent className={accordionContentVariants({ variant })}>
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export { AcordionAtom };
