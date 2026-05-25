import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export const orbitFlag = {
  enabled: true,
  nameToolActive: false,
};

export const orbitControlsRef: { current: OrbitControlsImpl | null } = {
  current: null,
};

export const setOrbitLockedByNameTool = (locked: boolean) => {
  orbitFlag.nameToolActive = locked;
  const controls = orbitControlsRef.current;
  if (controls) {
    controls.enabled = locked ? false : orbitFlag.enabled;
  }
};
