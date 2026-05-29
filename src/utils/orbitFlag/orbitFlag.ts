import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const orbitFlag = {
  enabled: true,
};

const orbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };

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

export { isOrbitControlsEnabled, orbitControlsRef, setAsidePointerOver };
