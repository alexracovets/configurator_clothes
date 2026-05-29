import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export const orbitFlag = {
  enabled: true,
  toolPanelActive: false,
};

export const orbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };

export const isOrbitControlsEnabled = () => orbitFlag.enabled && !orbitFlag.toolPanelActive;

const applyOrbitEnabled = () => {
  const controls = orbitControlsRef.current;
  if (!controls) return;
  controls.enabled = isOrbitControlsEnabled();
};

export const setAsidePointerOver = (over: boolean) => {
  orbitFlag.enabled = !over;
  applyOrbitEnabled();
};

export const setOrbitLockedByToolPanel = (locked: boolean) => {
  orbitFlag.toolPanelActive = locked;
  applyOrbitEnabled();
};

export const setOrbitLockedByNameTool = setOrbitLockedByToolPanel;
