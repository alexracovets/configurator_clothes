import * as React from 'react';

import { Select as SelectPrimitive } from '@base-ui/react/select';

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@utils';

const Select = SelectPrimitive.Root;

const SelectValue = ({ className, ...props }: SelectPrimitive.Value.Props) => {
  return <SelectPrimitive.Value data-slot="select-value" className={cn('', className)} {...props} />;
};

const SelectTrigger = ({
  className,
  size = 'default',
  children,
  icon,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: 'sm' | 'default';
  icon?: boolean;
}) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn('flex items-center justify-center gap-1 leading-none cursor-pointer', className)}
      {...props}
    >
      {children}
      {icon && <SelectPrimitive.Icon render={<ChevronDownIcon className="size-4" />} />}
    </SelectPrimitive.Trigger>
  );
};

const SelectContent = ({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'>) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-9999"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin)',
            'overflow-x-hidden overflow-y-auto shadow-md rounded-md bg-white',
            'data-[align-trigger=true]:animate-none',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            'duration-300',
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
};

const SelectItem = ({ className, children, style, ...props }: SelectPrimitive.Item.Props & { style?: React.CSSProperties }) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      style={style}
      className={cn(
        'cursor-pointer p-2',
        'relative w-full flex items-center',
        'outline-hidden select-none',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-border",
        'after:scale-x-0 after:origin-left after:transition-transform after:duration-200',
        'hover:after:scale-x-100 data-highlighted:after:scale-x-100 data-selected:after:scale-x-100',
        'last:after:hidden',
        ' data-highlighted:bg-border/50 data-selected:bg-border/50 ',
        'transition-colors duration-200',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator render={<span className="absolute right-2 flex items-center justify-center size-4 " />}>
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
};

const SelectScrollUpButton = ({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) => {
  return (
    <SelectPrimitive.ScrollUpArrow data-slot="select-scroll-up-button" className={cn('', className)} {...props}>
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
};

const SelectScrollDownButton = ({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) => {
  return (
    <SelectPrimitive.ScrollDownArrow data-slot="select-scroll-down-button" className={cn('', className)} {...props}>
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
