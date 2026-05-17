"use client";

import { ImArrowLeft, ImArrowRight } from "react-icons/im";
import { LuCircleMinus, LuCirclePlus } from "react-icons/lu";
import { useRef } from "react";

import { cameraBridge } from "../../organisms/ConfiguratorCanvas/CanvasControl/ViewControls";
import { Button } from "../../atoms";

const HOLD_DELAY_MS = 300;

const CanvasButtons = () => {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRotateStart = (dir: 1 | -1) => {
    cameraBridge.rotate(dir);
    holdTimerRef.current = setTimeout(() => {
      cameraBridge.startRotate(dir);
    }, HOLD_DELAY_MS);
  };

  const handleRotateEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    cameraBridge.stopRotate();
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
      <Button
        variant="ghost"
        size="icon"
        onMouseDown={() => handleRotateStart(-1)}
        onMouseUp={handleRotateEnd}
        onMouseLeave={handleRotateEnd}
        className="hover:scale-[1.1] transition-all duration-200 ease-in"
      >
        <ImArrowLeft className="w-[25px] h-[25px] text-primary-10" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => cameraBridge.zoom(-1)}
        className="hover:scale-[1.1] transition-all duration-200 ease-in"
      >
        <LuCircleMinus className="size-6 text-primary-10" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => cameraBridge.zoom(1)}
        className="hover:scale-[1.1] transition-all duration-200 ease-in"
      >
        <LuCirclePlus className="size-6 text-primary-10" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onMouseDown={() => handleRotateStart(1)}
        onMouseUp={handleRotateEnd}
        onMouseLeave={handleRotateEnd}
        className="hover:scale-[1.1] transition-all duration-200 ease-in"
      >
        <ImArrowRight className="w-[25px] h-[25px] text-primary-10" />
      </Button>
    </div>
  );
};

export { CanvasButtons };
