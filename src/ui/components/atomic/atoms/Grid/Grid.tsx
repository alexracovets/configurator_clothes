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
      configurator: "grid-cols-[334px_1fr_253px] h-full min-h-0",
      configurator_price: "grid-cols-[auto_auto] items-center gap-3",
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
