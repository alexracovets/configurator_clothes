"use client";

import { useRef } from "react";
import { ImArrowLeft, ImArrowRight } from "react-icons/im";
import { LuCircleMinus, LuCirclePlus } from "react-icons/lu";

import { cameraBridge } from "@organisms";
import { Button } from "@atoms";

const HOLD_DELAY_MS = 300;

type IconButtonConfig = {
  icon: React.ReactNode;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
};

const CanvasButtons = () => {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRotateStart = (dir: 1 | -1) => {
    cameraBridge.rotate(dir);
    holdTimerRef.current = setTimeout(() => cameraBridge.startRotate(dir), HOLD_DELAY_MS);
  };

  const handleRotateEnd = () => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    cameraBridge.stopRotate();
  };

  const buttons: IconButtonConfig[] = [
    { icon: <ImArrowLeft className="w-[25px] h-[25px] text-primary-10" />, onMouseDown: () => handleRotateStart(-1), onMouseUp: handleRotateEnd, onMouseLeave: handleRotateEnd },
    { icon: <LuCircleMinus className="size-6 text-primary-10" />, onClick: () => cameraBridge.zoom(-1) },
    { icon: <LuCirclePlus className="size-6 text-primary-10" />, onClick: () => cameraBridge.zoom(1) },
    { icon: <ImArrowRight className="w-[25px] h-[25px] text-primary-10" />, onMouseDown: () => handleRotateStart(1), onMouseUp: handleRotateEnd, onMouseLeave: handleRotateEnd },
  ];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
      {buttons.map((btn, i) => (
        <Button key={i} variant="ghost" size="icon" className="hover:scale-[1.1] transition-all duration-200 ease-in" onClick={btn.onClick} onMouseDown={btn.onMouseDown} onMouseUp={btn.onMouseUp} onMouseLeave={btn.onMouseLeave}>
          {btn.icon}
        </Button>
      ))}
    </div>
  );
};

export { CanvasButtons };
