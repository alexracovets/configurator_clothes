"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@shared";
import { cva, VariantProps } from "class-variance-authority";

const variantTrigger = cva("font-inter", {
  variants: {
    variant: {
      default: "",
      leng_switcher:
        "text-[14px] px-4 py-1.5 rounded-full border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const variantContent = cva("", {
  variants: {
    variant: {
      default: "",
      leng_switcher: "text-[14px] bg-white border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface AtomSelectProps extends React.ComponentProps<typeof Select> {
  options: { label: string; value: string }[];
  value: { label: string; value: string };
  onChange: (value: { label: string; value: string }) => void;
  icon?: boolean;
  variant?: VariantProps<typeof variantTrigger>["variant"];
}

const AtomSelect = ({
  options,
  value,
  onChange,
  variant = "default",
  icon = false,
}: AtomSelectProps) => {
  return (
    <Select
      value={value.value}
      onValueChange={(value) =>
        onChange({
          label: options.find((option) => option.value === value)?.label || "",
          value: value || "",
        })
      }
    >
      <SelectTrigger className={variantTrigger({ variant })} icon={icon}>
        <SelectValue>{value.label}</SelectValue>
      </SelectTrigger>
      <SelectContent
        className={variantContent({ variant })}
        side="bottom"
        align="center"
        alignItemWithTrigger={false}
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { AtomSelect };
