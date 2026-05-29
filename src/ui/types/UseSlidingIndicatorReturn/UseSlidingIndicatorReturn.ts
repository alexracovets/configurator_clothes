import type { RefObject } from "react";

import type { IndicatorStyle } from "@types";

export interface UseSlidingIndicatorReturn {
  wrapperRef: RefObject<HTMLDivElement | null>;
  getItemRef: (index: number) => (el: HTMLElement | null) => void;
  indicator: IndicatorStyle;
}
