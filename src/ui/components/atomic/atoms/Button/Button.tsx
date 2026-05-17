import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@utils";

const buttonVariants = cva(
  cn(
    "cursor-pointer group/button inline-flex shrink-0 whitespace-nowrap",
    "border border-transparent",
    "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-border",
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-red aria-invalid:ring-1 aria-invalid:ring-red",
    "transition-all duration-200 ease-in",
  ),
  {
    variants: {
      variant: {
        default: "flex items-center justify-center font-semibold bg-primary-button hover:bg-primary-button/80",
        outline: "",
        secondary: "",
        ghost: "bg-white hover:border-border",
        destructive: "",
        link: "",
      },
      size: {
        default: "",
        xs: "",
        sm: "py-3 px-4 text-4 leading-4 rounded-[8px] gap-2",
        lg: "",
        icon: "p-1 rounded-sm",
        "icon-xs": "",
        "icon-sm": "",
        "icon-lg": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
