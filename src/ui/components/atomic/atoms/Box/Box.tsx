"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import type { ChildrenType } from "@types";
import { cn } from "@utils";

const variantBox = cva("block", {
  variants: {
    variant: {
      default: "",
      header: "bg-white py-5",
      footer: "bg-white py-15",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BoxProps extends ChildrenType {
  variant?: VariantProps<typeof variantBox>["variant"];
  style?: React.CSSProperties;
  className?: string;
  asChild?: boolean;
}

const Box = ({
  variant = "default",
  asChild = false,
  className,
  children,
  style,
  ...props
}: BoxProps) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(variantBox({ variant, className }))}
      {...props}
      style={style}
    >
      {children}
    </Component>
  );
};

export { Box };
