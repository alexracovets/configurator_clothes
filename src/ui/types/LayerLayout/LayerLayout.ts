import type { GizmoHandle } from "@types";

export interface LayerLayout {
  textBox: { x: number; y: number; w: number; h: number };
  handles: Record<GizmoHandle, { x: number; y: number }>;
}

export interface LayerGlyph {
  canvas: HTMLCanvasElement;
  halfW: number;
  halfH: number;
  styleSerial: string;
}
