'use client';

import { useCallback, useRef } from 'react';

import { ImArrowLeft, ImArrowRight } from 'react-icons/im';
import { LuCircleMinus, LuCirclePlus } from 'react-icons/lu';

import { cameraBridge } from '@organisms';
import { Button } from '@atoms';

const HOLD_DELAY_MS = 300;

const CanvasButtons = () => {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRotateStart = useCallback((dir: 1 | -1) => {
    cameraBridge.rotate(dir);
    holdTimerRef.current = setTimeout(() => cameraBridge.startRotate(dir), HOLD_DELAY_MS);
  }, []);

  const handleRotateEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    cameraBridge.stopRotate();
  }, []);

  const handleZoomOut = useCallback(() => cameraBridge.zoom(-1), []);
  const handleZoomIn = useCallback(() => cameraBridge.zoom(1), []);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
      <Button
        variant="ghost"
        size="icon"
        className="hover:scale-[1.1] transition-all duration-200 ease-in"
        onMouseDown={() => handleRotateStart(-1)}
        onMouseUp={handleRotateEnd}
        onMouseLeave={handleRotateEnd}
      >
        <ImArrowLeft className="w-[25px] h-[25px] text-primary-10" />
      </Button>
      <Button variant="ghost" size="icon" className="hover:scale-[1.1] transition-all duration-200 ease-in" onClick={handleZoomOut}>
        <LuCircleMinus className="size-6 text-primary-10" />
      </Button>
      <Button variant="ghost" size="icon" className="hover:scale-[1.1] transition-all duration-200 ease-in" onClick={handleZoomIn}>
        <LuCirclePlus className="size-6 text-primary-10" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:scale-[1.1] transition-all duration-200 ease-in"
        onMouseDown={() => handleRotateStart(1)}
        onMouseUp={handleRotateEnd}
        onMouseLeave={handleRotateEnd}
      >
        <ImArrowRight className="w-[25px] h-[25px] text-primary-10" />
      </Button>
    </div>
  );
};

export { CanvasButtons };
