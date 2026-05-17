"use client";

import { useRef } from "react";
import { cameraBridge } from "../ViewControls/ViewControls";

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
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
      <button
        className="w-8 h-8 rounded-full border border-gray-400 bg-white/70 flex items-center justify-center text-sm hover:bg-white transition-colors cursor-pointer select-none"
        onMouseDown={() => handleRotateStart(-1)}
        onMouseUp={handleRotateEnd}
        onMouseLeave={handleRotateEnd}
      >
        ←
      </button>
      <button
        className="w-8 h-8 rounded-full border border-gray-400 bg-white/70 flex items-center justify-center text-sm hover:bg-white transition-colors cursor-pointer select-none"
        onClick={() => cameraBridge.zoom(-1)}
      >
        −
      </button>
      <button
        className="w-8 h-8 rounded-full border border-gray-400 bg-white/70 flex items-center justify-center text-sm hover:bg-white transition-colors cursor-pointer select-none"
        onClick={() => cameraBridge.zoom(1)}
      >
        +
      </button>
      <button
        className="w-8 h-8 rounded-full border border-gray-400 bg-white/70 flex items-center justify-center text-sm hover:bg-white transition-colors cursor-pointer select-none"
        onMouseDown={() => handleRotateStart(1)}
        onMouseUp={handleRotateEnd}
        onMouseLeave={handleRotateEnd}
      >
        →
      </button>
    </div>
  );
};

export { CanvasButtons };
