"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";

import { cn } from "@utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollArea = ({ children, className }: ScrollAreaProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<OverlayScrollbars | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);

  const refresh = useMemo(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!instanceRef.current) return;
        instanceRef.current.update(true);
        const hasScroll = instanceRef.current.state().overflowAmount.y > 0;
        if (!hasScroll) {
          setHasVerticalScroll(false);
        } else {
          setTimeout(() => setHasVerticalScroll(true), 50);
        }
      }, 300);
    },
    [],
  );

  useEffect(() => {
    if (!targetRef.current || !viewportRef.current || !contentRef.current)
      return;

    const instance = OverlayScrollbars(
      {
        target: targetRef.current,
        elements: {
          viewport: viewportRef.current,
          content: contentRef.current,
        },
      },
      {
        scrollbars: {
          theme: "os-theme-custom",
          visibility: "auto",
        },
      },
    );

    instanceRef.current = instance;

    const ro = new ResizeObserver(refresh);
    ro.observe(contentRef.current);

    refresh();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ro.disconnect();
      instance.destroy();
      instanceRef.current = null;
    };
  }, [refresh]);

  return (
    <div
      ref={targetRef}
      className={cn("h-full w-full", className)}
      style={{
        paddingRight: hasVerticalScroll ? 8 : 0,
        transition: "padding-right 0.1s ease-in-out",
      }}
    >
      <div
        ref={viewportRef}
        className="h-full w-full overflow-y-scroll overflow-x-hidden"
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}

export { ScrollArea };
