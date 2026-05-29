import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const orbitFlag = {
  enabled: true,
  toolPanelActive: false,
};

const orbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };

const isOrbitControlsEnabled = () => orbitFlag.enabled && !orbitFlag.toolPanelActive;

const applyOrbitEnabled = () => {
  const controls = orbitControlsRef.current;
  if (!controls) return;
  controls.enabled = isOrbitControlsEnabled();
};

const setAsidePointerOver = (over: boolean) => {
  orbitFlag.enabled = !over;
  applyOrbitEnabled();
};

const setOrbitLockedByToolPanel = (locked: boolean) => {
  orbitFlag.toolPanelActive = locked;
  applyOrbitEnabled();
};

const setOrbitLockedByNameTool = setOrbitLockedByToolPanel;

export { orbitFlag, orbitControlsRef, isOrbitControlsEnabled, setAsidePointerOver, setOrbitLockedByToolPanel, setOrbitLockedByNameTool };
