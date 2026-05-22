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
      select_parts:
        "grid-cols-[repeat(auto-fill,minmax(55px,1fr))] gap-2 w-full",
      aside_configurator: cn(
        "grid-rows-[auto_1fr] w-full max-w-[354px] h-[100vh] rounded-[10px]",
        "p-[10px] translate-y-[-10px] translate-x-[-10px] max-h-[calc(100vh-180px)] backdrop-blur-sm",
      ),
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
