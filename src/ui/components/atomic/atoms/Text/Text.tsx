"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import type { ChildrenType } from "@types";
import { cn } from "@utils";

const variantText = cva("font-inter font-[400] leading-none", {
  variants: {
    variant: {
      default: "",
      whatsapp_badge: "text-[14px] leading-[24px] text-white font-medium",
      product_name: "text-[32px] leading-[1] font-[600] tracking-[-1px]",
      product_price: "text-[32px] leading-[39px] font-semibold tracking-[-1px]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TextProps extends ChildrenType {
  variant?: VariantProps<typeof variantText>["variant"];
  style?: React.CSSProperties;
  className?: string;
  asChild?: boolean;
}

const Text = ({
  className,
  variant,
  asChild = false,
  children,
  ...props
}: TextProps) => {
  const Comp = asChild ? Slot : "p";

  return (
    <Comp
      data-slot="text"
      className={cn(variantText({ variant, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
};

export { Text };
