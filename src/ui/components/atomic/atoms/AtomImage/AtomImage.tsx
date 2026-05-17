"use client";

import { cva, VariantProps } from "class-variance-authority";
import Image from "next/image";

import type { ChildrenType } from "@types";
import { cn } from "@utils";

const variantAtomImage = cva("", {
  variants: {
    variant: {
      default: "w-auto h-auto",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface AtomImageProps extends ChildrenType {
  src: string;
  alt: string;
  variant?: VariantProps<typeof variantAtomImage>["variant"];
  noCover?: boolean;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
}

const AtomImage = ({
  src,
  alt,
  variant = "default",
  priority = false,
  className,
  noCover = true,
  width,
  height,
  unoptimized = true,
}: AtomImageProps) => {
  const hasDimensions = width != null && height != null;

  const imageElement = (
    <Image
      src={src || ""}
      alt={alt || "image"}
      priority={priority}
      sizes="100%"
      loading="eager"
      {...(noCover
        ? hasDimensions
          ? { width, height }
          : {}
        : { fill: true })}
      className={cn(
        !noCover ? "object-cover" : "object-contain",
        noCover && !hasDimensions && variantAtomImage({ variant }),
        noCover && className,
      )}
      unoptimized={unoptimized}
    />
  );

  if (noCover) {
    return imageElement;
  }

  return (
    <div className={cn("relative", variantAtomImage({ variant }), className)}>
      {imageElement}
    </div>
  );
};

export { AtomImage, variantAtomImage };
