import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export const orbitFlag = {
  /** False while pointer is over the aside panel. */
  enabled: true,
  /** True while a design layer is selected / gizmo drag is active (name, number, logo steps). */
  toolPanelActive: false,
};

export const orbitControlsRef: { current: OrbitControlsImpl | null } = {
  current: null,
};

export const isOrbitControlsEnabled = () =>
  orbitFlag.enabled && !orbitFlag.toolPanelActive;

const applyOrbitEnabled = () => {
  const controls = orbitControlsRef.current;
  if (!controls) return;
  controls.enabled = isOrbitControlsEnabled();
};

/** Disable orbit while the pointer is over the aside panel. */
export const setAsidePointerOver = (over: boolean) => {
  orbitFlag.enabled = !over;
  applyOrbitEnabled();
};

/** Lock mouse-orbit only when the 3D tool panel / gizmo is in use. */
export const setOrbitLockedByToolPanel = (locked: boolean) => {
  orbitFlag.toolPanelActive = locked;
  applyOrbitEnabled();
};

/** @deprecated Use setOrbitLockedByToolPanel */
export const setOrbitLockedByNameTool = setOrbitLockedByToolPanel;
