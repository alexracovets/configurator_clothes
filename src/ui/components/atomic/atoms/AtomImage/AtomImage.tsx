"use client";

import { cva, VariantProps } from "class-variance-authority";
import Image, { ImageProps } from "next/image";

import type { ChildrenType } from "@types";
import { cn } from "@utils";

const variantAtomImage = cva("", {
  variants: {
    variant: {
      default: "w-full h-full",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface AtomImageProps extends ChildrenType, ImageProps {
  src: string;
  alt: string;
  variant?: VariantProps<typeof variantAtomImage>["variant"];
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  "data-active"?: boolean;
}

const AtomImage = ({
  src,
  alt,
  variant = "default",
  priority = false,
  className,
  width,
  height,
  unoptimized = true,
  "data-active": dataActive,
  ...props
}: AtomImageProps) => {
  const hasDimensions = width != null && height != null;
  const useFill = !hasDimensions;

  const imageElement = (
    <Image
      src={src || ""}
      alt={alt || "image"}
      priority={priority}
      sizes="100%"
      loading="eager"
      {...(hasDimensions ? { width, height } : { fill: true })}
      className={cn("object-cover", !useFill && className)}
      unoptimized={unoptimized}
      {...props}
    />
  );

  if (useFill) {
    return (
      <div
        data-active={dataActive}
        className={cn("relative", variantAtomImage({ variant }), className)}
      >
        {imageElement}
      </div>
    );
  }

  return imageElement;
};

export { AtomImage, variantAtomImage };
