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

const applyOrbitEnabled = () => {
  const controls = orbitControlsRef.current;
  if (!controls) return;
  controls.enabled = orbitFlag.enabled && !orbitFlag.toolPanelActive;
};

/** Lock mouse-orbit only when the 3D tool panel / gizmo is in use. */
export const setOrbitLockedByToolPanel = (locked: boolean) => {
  orbitFlag.toolPanelActive = locked;
  applyOrbitEnabled();
};

/** @deprecated Use setOrbitLockedByToolPanel */
export const setOrbitLockedByNameTool = setOrbitLockedByToolPanel;
