"use client";

import type { SvgIconName } from "@types";
import { cn } from "@utils";

interface SvgIconProps {
  name: SvgIconName;
  className?: string;
}

const ICONS: Record<SvgIconName, React.ReactNode> = {
  colori: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip-color)">
        <path
          d="M1.13807 6.46461L6.05702 1.54565L11.9596 7.44826L7.04137 12.3672C6.91216 12.4966 6.75871 12.5992 6.58981 12.6692C6.42091 12.7392 6.23986 12.7753 6.05702 12.7753C5.87418 12.7753 5.69314 12.7392 5.52424 12.6692C5.35534 12.5992 5.20189 12.4966 5.07268 12.3672L1.13807 8.43191C0.877239 8.17101 0.730713 7.81719 0.730713 7.44826C0.730713 7.07934 0.877239 6.72552 1.13807 6.46461Z"
          fill="currentColor" stroke="currentColor" strokeWidth="1.04348" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M5.07336 0.562012L6.05702 1.54566"
          stroke="currentColor" strokeWidth="1.04348" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          fillRule="evenodd" clipRule="evenodd"
          d="M13.2174 9.73907C13.2174 9.73907 15.3043 11.8212 15.3043 13.1387C15.3043 14.29 14.3687 15.2257 13.2174 15.2257C12.0661 15.2257 11.1388 14.29 11.1304 13.1387C11.1374 11.8205 13.2174 9.73907 13.2174 9.73907Z"
          fill="currentColor" stroke="currentColor" strokeWidth="1.04348" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip-color">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  contorno: (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
      <path
        d="M10.32 5.26997C7.5 7.86997 4.83 10.34 2.46 9.10997L1.57 8.64997L0.660004 10.43L1.55 10.89C2.3 11.27 3.04 11.44 3.78 11.44C6.59 11.44 9.27 8.96997 11.69 6.72997C14.51 4.11997 17.18 1.65997 19.55 2.88997L20.44 3.34997L21.35 1.56997L20.46 1.10997C16.84 -0.750026 13.38 2.43997 10.32 5.26997Z"
        fill="currentColor"
      />
    </svg>
  ),
};

const SvgIcon = ({ name, className }: SvgIconProps) => {
  return (
    <span className={cn("inline-flex items-center justify-center shrink-0", className)}>
      {ICONS[name]}
    </span>
  );
};

export { SvgIcon };
