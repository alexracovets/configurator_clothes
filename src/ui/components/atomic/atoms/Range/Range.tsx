"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { Slider } from "@shared";
import { cn } from "@utils";

import type { Slider as SliderPrimitive } from "@base-ui/react/slider";

const rangeVariants = cva("", {
  variants: {
    variant: {
      default: cn(
        // track
        "[&_[data-slot=slider-track]]:h-[4px]",
        "[&_[data-slot=slider-track]]:bg-gray-20",
        // range (indicator)
        "[&_[data-slot=slider-range]]:bg-[#000000]",
        // thumb
        "[&_[data-slot=slider-thumb]]:size-[10px]",
        "[&_[data-slot=slider-thumb]]:bg-[#000000]",
        "[&_[data-slot=slider-thumb]]:border-[#000000]",
      ),
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const thumbSizeMap: Record<
  NonNullable<VariantProps<typeof rangeVariants>["variant"]>,
  number
> = {
  default: 10,
};

type RangeProps = SliderPrimitive.Root.Props &
  VariantProps<typeof rangeVariants> & {
    className?: string;
    wrapperClassName?: string;
  };

function Range({
  className,
  wrapperClassName,
  variant = "default",
  value,
  onChange,
  min = 0,
  max = 100,
  ...props
}: RangeProps) {
  const thumbSize = thumbSizeMap[variant ?? "default"];

  const halfThumb = thumbSize / 2;

  return (
    <div
      className={cn("w-full flex items-center", wrapperClassName)}
      style={{ height: thumbSize, paddingInline: halfThumb }}
    >
      <Slider
        className={cn("w-full", rangeVariants({ variant }), className)}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        {...props}
      />
    </div>
  );
}

export { Range, rangeVariants };
