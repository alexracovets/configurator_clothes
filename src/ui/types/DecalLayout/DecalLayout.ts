import type { GizmoHandle } from "../GizmoZone";

export interface DecalLayout {
  textBox: { x: number; y: number; w: number; h: number };
  handles: Record<GizmoHandle, { x: number; y: number }>;
  handleRadius: number;
}
