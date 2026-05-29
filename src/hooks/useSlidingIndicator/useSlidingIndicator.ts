import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { IndicatorStyle, UseSlidingIndicatorReturn } from '@types';

const useSlidingIndicator = (activeIndex: number): UseSlidingIndicatorReturn => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [indicator, setIndicator] = useState<IndicatorStyle>({ left: 0, width: 0 });

  const getItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  const updateIndicator = useCallback(() => {
    const wrapper = wrapperRef.current;
    const item = itemRefs.current[activeIndex];
    if (!wrapper || !item) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    setIndicator({ left: itemRect.left - wrapperRect.left, width: itemRect.width });
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(wrapper);
    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });
    window.addEventListener('resize', updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  return { wrapperRef, getItemRef, indicator };
};

export { useSlidingIndicator };
