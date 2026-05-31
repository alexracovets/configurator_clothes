import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const orbitFlag = {
  enabled: true,
};

const orbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };

let asideRoot: HTMLElement | null = null;
let lastClientX = -1;
let lastClientY = -1;
let guardActive = false;

const isOrbitControlsEnabled = () => orbitFlag.enabled;

const applyOrbitEnabled = () => {
  const controls = orbitControlsRef.current;
  if (!controls) return;
  controls.enabled = isOrbitControlsEnabled();
};

const setAsidePointerOver = (over: boolean) => {
  orbitFlag.enabled = !over;
  applyOrbitEnabled();
};

const syncAsidePointerOver = () => {
  if (!asideRoot) {
    setAsidePointerOver(false);
    return;
  }
  if (lastClientX < 0 || lastClientY < 0) {
    setAsidePointerOver(false);
    return;
  }
  const target = document.elementFromPoint(lastClientX, lastClientY);
  setAsidePointerOver(!!target && asideRoot.contains(target));
};

const onPointerMove = (e: PointerEvent) => {
  lastClientX = e.clientX;
  lastClientY = e.clientY;
  syncAsidePointerOver();
};

/** File picker / OS modal does not fire pointerleave — re-enable orbit while dialog is open. */
const onWindowBlur = () => {
  setAsidePointerOver(false);
};

const onWindowFocus = () => {
  syncAsidePointerOver();
};

const registerAsideOrbitGuard = (element: HTMLElement | null): (() => void) => {
  asideRoot = element;

  if (!element || typeof document === 'undefined') {
    setAsidePointerOver(false);
    return () => {};
  }

  if (!guardActive) {
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    guardActive = true;
  }

  syncAsidePointerOver();

  return () => {
    asideRoot = null;
    if (guardActive) {
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      guardActive = false;
      lastClientX = -1;
      lastClientY = -1;
    }
    setAsidePointerOver(false);
  };
};

export { isOrbitControlsEnabled, orbitControlsRef, registerAsideOrbitGuard, setAsidePointerOver };
