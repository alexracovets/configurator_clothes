"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import type { ChildrenType } from "@types";
import { cn } from "@utils";

const variantGrid = cva("grid", {
  variants: {
    variant: {
      default: "",
      header: "grid-cols-[1fr_auto_1fr] items-center",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface GridProps extends ChildrenType {
  variant?: VariantProps<typeof variantGrid>["variant"];
  style?: React.CSSProperties;
  className?: string;
  asChild?: boolean;
}

const Grid = ({
  variant = "default",
  asChild = false,
  className,
  children,
  style,
  ...props
}: GridProps) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(variantGrid({ variant, className }))}
      {...props}
      style={style}
    >
      {children}
    </Component>
  );
};

export { Grid };
