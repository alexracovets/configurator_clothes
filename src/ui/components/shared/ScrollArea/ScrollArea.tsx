"use client";

import { useEffect, useRef, useState } from "react";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";

import { cn } from "@utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

function ScrollArea({ children, className }: ScrollAreaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);

  useEffect(() => {
    if (!rootRef.current || !contentRef.current) return;

    const instance = OverlayScrollbars(
      {
        target: rootRef.current,
        elements: {
          viewport: rootRef.current,
          content: contentRef.current,
        },
      },
      {
        scrollbars: {
          theme: "os-theme-custom",
          visibility: "auto",
        },
      },
      {
        scroll: (_, event) => {
          const state = instance.state();
          setHasVerticalScroll(state.overflowAmount.y > 0);
        },
      },
    );

    const checkOverflow = () => {
      const state = instance.state();
      setHasVerticalScroll(state.overflowAmount.y > 0);
    };

    checkOverflow();

    const ro = new ResizeObserver(checkOverflow);
    if (rootRef.current) ro.observe(rootRef.current);
    if (contentRef.current) ro.observe(contentRef.current);

    return () => {
      ro.disconnect();
      instance.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("h-full w-full overflow-x-hidden pr-2", className)}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

export { ScrollArea };
