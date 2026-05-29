import type * as THREE from "three";

import type { GizmoHandle, GizmoZone, DecalLayout } from "@types";

export type { GizmoHandle, GizmoZone, DecalLayout };

const DECAL_CANVAS_W = 1024;
const DECAL_CANVAS_H = 256;

const GIZMO_HANDLES: GizmoHandle[] = ["copy", "delete", "rotate", "resize"];

export interface DecalDrawParams {
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  showGizmo: boolean;
  hoveredZone?: GizmoZone | null;
}

const CSS_VAR_TO_FONT: Record<string, string> = {
  "--font-oswald": "Oswald",
  "--font-bebas-neue": "Bebas Neue",
  "--font-anton": "Anton",
  "--font-russo-one": "Russo One",
  "--font-black-ops-one": "Black Ops One",
};

const resolveFont = (font: string): string => CSS_VAR_TO_FONT[font] ?? font;

const HANDLE_RADIUS = 26;
const HANDLE_OFFSET = HANDLE_RADIUS + 6;
const BOX_PAD_X = 28;
const BOX_PAD_Y = 18;
const GIZMO_HIT_MARGIN = 56;

const buildDecalLayout = (ctx: CanvasRenderingContext2D, text: string, font: string, fontSize: number): DecalLayout => {
  ctx.font = `bold ${fontSize}px "${resolveFont(font)}"`;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize * 1.1;
  const cx = DECAL_CANVAS_W / 2;
  const cy = DECAL_CANVAS_H / 2;
  const textBox = {
    x: cx - textW / 2 - BOX_PAD_X,
    y: cy - textH / 2 - BOX_PAD_Y,
    w: textW + BOX_PAD_X * 2,
    h: textH + BOX_PAD_Y * 2,
  };
  return {
    textBox,
    handleRadius: HANDLE_RADIUS,
    handles: {
      copy:   { x: textBox.x - HANDLE_OFFSET,              y: textBox.y - HANDLE_OFFSET },
      delete: { x: textBox.x - HANDLE_OFFSET,              y: textBox.y + textBox.h + HANDLE_OFFSET },
      rotate: { x: textBox.x + textBox.w + HANDLE_OFFSET,  y: textBox.y - HANDLE_OFFSET },
      resize: { x: textBox.x + textBox.w + HANDLE_OFFSET,  y: textBox.y + textBox.h + HANDLE_OFFSET },
    },
  };
};

const drawDecal = (canvas: HTMLCanvasElement, params: DecalDrawParams): DecalLayout => {
  const { text, font, fontSize, textColor, strokeColor, strokeWidth, showGizmo, hoveredZone = null } = params;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, DECAL_CANVAS_W, DECAL_CANVAS_H);
  const layout = buildDecalLayout(ctx, text, font, fontSize);
  const cx = DECAL_CANVAS_W / 2;
  const cy = DECAL_CANVAS_H / 2;
  ctx.font = `bold ${fontSize}px "${resolveFont(font)}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, cx, cy);
  }
  ctx.fillStyle = textColor;
  ctx.fillText(text, cx, cy);
  if (showGizmo) {
    drawGizmoFrame(ctx, layout.textBox, hoveredZone === "body");
    for (const kind of GIZMO_HANDLES) drawHandle(ctx, layout.handles[kind], kind, hoveredZone === kind);
  }
  return layout;
};

const uvToCanvasCandidates = (uv: THREE.Vector2): { x: number; y: number }[] => [
  { x: uv.x * DECAL_CANVAS_W, y: (1 - uv.y) * DECAL_CANVAS_H },
  { x: uv.x * DECAL_CANVAS_W, y: uv.y * DECAL_CANVAS_H },
];

const distToHandle = (pt: { x: number; y: number }, layout: DecalLayout, handle: GizmoHandle) =>
  Math.hypot(pt.x - layout.handles[handle].x, pt.y - layout.handles[handle].y);

const isInsideTextBox = (pt: { x: number; y: number }, box: DecalLayout["textBox"]) =>
  pt.x >= box.x && pt.x <= box.x + box.w && pt.y >= box.y && pt.y <= box.y + box.h;

const getGizmoOuterBounds = (layout: DecalLayout) => {
  const { textBox } = layout;
  const pad = HANDLE_OFFSET + GIZMO_HIT_MARGIN;
  return { x: textBox.x - pad, y: textBox.y - pad, w: textBox.w + pad * 2, h: textBox.h + pad * 2 };
};

const isInsideGizmoOuter = (pt: { x: number; y: number }, layout: DecalLayout) => {
  const b = getGizmoOuterBounds(layout);
  return pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h;
};

const hitTestAtCanvasPoint = (pt: { x: number; y: number }, layout: DecalLayout): GizmoZone => {
  if (!isInsideGizmoOuter(pt, layout)) return null;
  if (isInsideTextBox(pt, layout.textBox)) return "body";
  const hitRadius = layout.handleRadius + 10;
  for (const handle of GIZMO_HANDLES) {
    if (distToHandle(pt, layout, handle) <= hitRadius) return handle;
  }
  return null;
};

const hitTestDecal = (uv: THREE.Vector2, layout: DecalLayout): GizmoZone => {
  for (const pt of uvToCanvasCandidates(uv)) {
    const zone = hitTestAtCanvasPoint(pt, layout);
    if (zone !== null) return zone;
  }
  return null;
};

const gizmoCursor = (zone: GizmoZone): string => (!zone ? "auto" : "pointer");

const drawGizmoFrame = (ctx: CanvasRenderingContext2D, box: DecalLayout["textBox"], hovered: boolean) => {
  ctx.save();
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = hovered ? "rgba(147,197,253,0.95)" : "rgba(255,255,255,0.95)";
  ctx.lineWidth = hovered ? 3 : 2.5;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.restore();
};

const drawHandle = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }, kind: GizmoHandle, hovered: boolean) => {
  const r = HANDLE_RADIUS;
  const s = 7;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = hovered ? "#dbeafe" : "#ffffff";
  ctx.fill();
  ctx.strokeStyle = hovered ? "#3b82f6" : "rgba(0,0,0,0.12)";
  ctx.lineWidth = hovered ? 2.5 : 1.5;
  ctx.stroke();
  if (hovered) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(59,130,246,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.strokeStyle = kind === "delete" ? "#ef4444" : hovered ? "#1d4ed8" : "#374151";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (kind) {
    case "copy":
      ctx.strokeRect(pos.x - s * 0.3, pos.y - s * 0.3, s * 0.85, s * 0.85);
      ctx.strokeRect(pos.x - s * 0.85, pos.y - s * 0.85, s * 0.85, s * 0.85);
      break;
    case "delete":
      ctx.beginPath(); ctx.moveTo(pos.x - s, pos.y - s * 0.5); ctx.lineTo(pos.x + s, pos.y - s * 0.5); ctx.stroke();
      ctx.strokeRect(pos.x - s * 0.65, pos.y - s * 0.15, s * 1.3, s * 0.95);
      break;
    case "rotate":
      ctx.beginPath(); ctx.arc(pos.x, pos.y, s * 0.55, 0.4, Math.PI * 1.6); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.45, pos.y - s * 0.55);
      ctx.lineTo(pos.x + s * 0.75, pos.y - s * 0.2);
      ctx.lineTo(pos.x + s * 0.35, pos.y - s * 0.35);
      ctx.stroke();
      break;
    case "resize":
      ctx.beginPath(); ctx.moveTo(pos.x - s, pos.y + s); ctx.lineTo(pos.x + s, pos.y - s); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.2, pos.y - s); ctx.lineTo(pos.x + s, pos.y - s); ctx.lineTo(pos.x + s, pos.y - s * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y - s * 0.2); ctx.lineTo(pos.x - s, pos.y + s); ctx.lineTo(pos.x - s * 0.2, pos.y + s);
      ctx.stroke();
      break;
  }
  ctx.restore();
};

export { DECAL_CANVAS_W, DECAL_CANVAS_H, buildDecalLayout, drawDecal, hitTestDecal, gizmoCursor };
