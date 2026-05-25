import type * as THREE from "three";

export const NAME_DECAL_CANVAS_W = 1024;
export const NAME_DECAL_CANVAS_H = 256;

export type GizmoHandle = "copy" | "delete" | "rotate" | "resize";
export type GizmoZone = GizmoHandle | "body" | null;

const GIZMO_HANDLES: GizmoHandle[] = ["copy", "delete", "rotate", "resize"];

export interface NameDecalLayout {
  textBox: { x: number; y: number; w: number; h: number };
  handles: Record<GizmoHandle, { x: number; y: number }>;
  handleRadius: number;
}

export interface NameDecalDrawParams {
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  showGizmo: boolean;
  hoveredZone?: GizmoZone | null;
}

const HANDLE_RADIUS = 26;
const HANDLE_OFFSET = HANDLE_RADIUS + 6;
const BOX_PAD_X = 28;
const BOX_PAD_Y = 18;
const GIZMO_HIT_MARGIN = 56;

export const buildNameDecalLayout = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  fontSize: number,
): NameDecalLayout => {
  ctx.font = `bold ${fontSize}px "${font}"`;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize * 1.1;
  const cx = NAME_DECAL_CANVAS_W / 2;
  const cy = NAME_DECAL_CANVAS_H / 2;

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
      copy: { x: textBox.x - HANDLE_OFFSET, y: textBox.y - HANDLE_OFFSET },
      delete: { x: textBox.x - HANDLE_OFFSET, y: textBox.y + textBox.h + HANDLE_OFFSET },
      rotate: { x: textBox.x + textBox.w + HANDLE_OFFSET, y: textBox.y - HANDLE_OFFSET },
      resize: { x: textBox.x + textBox.w + HANDLE_OFFSET, y: textBox.y + textBox.h + HANDLE_OFFSET },
    },
  };
};

export const drawNameDecal = (
  canvas: HTMLCanvasElement,
  params: NameDecalDrawParams,
): NameDecalLayout => {
  const {
    text,
    font,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    showGizmo,
    hoveredZone = null,
  } = params;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, NAME_DECAL_CANVAS_W, NAME_DECAL_CANVAS_H);

  const layout = buildNameDecalLayout(ctx, text, font, fontSize);
  const cx = NAME_DECAL_CANVAS_W / 2;
  const cy = NAME_DECAL_CANVAS_H / 2;

  ctx.font = `bold ${fontSize}px "${font}"`;
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
    for (const kind of GIZMO_HANDLES) {
      drawHandle(ctx, layout.handles[kind], kind, hoveredZone === kind);
    }
  }

  return layout;
};

const uvToCanvasCandidates = (uv: THREE.Vector2): { x: number; y: number }[] => [
  { x: uv.x * NAME_DECAL_CANVAS_W, y: (1 - uv.y) * NAME_DECAL_CANVAS_H },
  { x: uv.x * NAME_DECAL_CANVAS_W, y: uv.y * NAME_DECAL_CANVAS_H },
];

const distToHandle = (
  pt: { x: number; y: number },
  layout: NameDecalLayout,
  handle: GizmoHandle,
) => Math.hypot(pt.x - layout.handles[handle].x, pt.y - layout.handles[handle].y);

const isInsideTextBox = (
  pt: { x: number; y: number },
  box: NameDecalLayout["textBox"],
) =>
  pt.x >= box.x && pt.x <= box.x + box.w && pt.y >= box.y && pt.y <= box.y + box.h;

const getGizmoOuterBounds = (layout: NameDecalLayout) => {
  const { textBox } = layout;
  const pad = HANDLE_OFFSET + GIZMO_HIT_MARGIN;
  return {
    x: textBox.x - pad,
    y: textBox.y - pad,
    w: textBox.w + pad * 2,
    h: textBox.h + pad * 2,
  };
};

const isInsideGizmoOuter = (pt: { x: number; y: number }, layout: NameDecalLayout) => {
  const b = getGizmoOuterBounds(layout);
  return (
    pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h
  );
};

const quadrantHandle = (
  pt: { x: number; y: number },
  layout: NameDecalLayout,
): GizmoHandle => {
  const box = layout.textBox;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  if (pt.x < cx && pt.y < cy) return "copy";
  if (pt.x < cx && pt.y >= cy) return "delete";
  if (pt.x >= cx && pt.y < cy) return "rotate";
  return "resize";
};

const hitTestAtCanvasPoint = (
  pt: { x: number; y: number },
  layout: NameDecalLayout,
): GizmoZone => {
  if (!isInsideGizmoOuter(pt, layout)) return null;

  if (isInsideTextBox(pt, layout.textBox)) return "body";

  return quadrantHandle(pt, layout);
};

const resolveCanvasPoint = (
  uv: THREE.Vector2,
  layout: NameDecalLayout,
): { x: number; y: number } | null => {
  const candidates = uvToCanvasCandidates(uv);
  let bestPt: { x: number; y: number } | null = null;
  let bestScore = Infinity;

  for (const pt of candidates) {
    if (!isInsideGizmoOuter(pt, layout)) continue;

    const zone = hitTestAtCanvasPoint(pt, layout);
    if (!zone || zone === "body") {
      if (zone === "body") {
        const cx = layout.textBox.x + layout.textBox.w / 2;
        const cy = layout.textBox.y + layout.textBox.h / 2;
        const score = Math.hypot(pt.x - cx, pt.y - cy);
        if (score < bestScore) {
          bestScore = score;
          bestPt = pt;
        }
      }
      continue;
    }

    const score = distToHandle(pt, layout, zone);
    if (score < bestScore) {
      bestScore = score;
      bestPt = pt;
    }
  }

  if (bestPt) return bestPt;

  for (const pt of candidates) {
    if (isInsideGizmoOuter(pt, layout)) return pt;
  }

  return candidates[0] ?? null;
};

export const hitTestNameDecal = (
  uv: THREE.Vector2,
  layout: NameDecalLayout,
): GizmoZone => {
  const pt = resolveCanvasPoint(uv, layout);
  if (!pt) return null;
  return hitTestAtCanvasPoint(pt, layout);
};

export const gizmoCursor = (zone: GizmoZone): string => {
  if (!zone) return "auto";
  return "pointer";
};

const drawGizmoFrame = (
  ctx: CanvasRenderingContext2D,
  box: NameDecalLayout["textBox"],
  hovered: boolean,
) => {
  ctx.save();
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = hovered ? "rgba(147,197,253,0.95)" : "rgba(255,255,255,0.95)";
  ctx.lineWidth = hovered ? 3 : 2.5;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.restore();
};

const drawHandle = (
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  kind: GizmoHandle,
  hovered: boolean,
) => {
  const r = HANDLE_RADIUS;
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

  const s = 7;
  switch (kind) {
    case "copy":
      ctx.strokeRect(pos.x - s * 0.3, pos.y - s * 0.3, s * 0.85, s * 0.85);
      ctx.strokeRect(pos.x - s * 0.85, pos.y - s * 0.85, s * 0.85, s * 0.85);
      break;
    case "delete":
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y - s * 0.5);
      ctx.lineTo(pos.x + s, pos.y - s * 0.5);
      ctx.stroke();
      ctx.strokeRect(pos.x - s * 0.65, pos.y - s * 0.15, s * 1.3, s * 0.95);
      break;
    case "rotate":
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 0.55, 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.45, pos.y - s * 0.55);
      ctx.lineTo(pos.x + s * 0.75, pos.y - s * 0.2);
      ctx.lineTo(pos.x + s * 0.35, pos.y - s * 0.35);
      ctx.stroke();
      break;
    case "resize":
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y + s);
      ctx.lineTo(pos.x + s, pos.y - s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.2, pos.y - s);
      ctx.lineTo(pos.x + s, pos.y - s);
      ctx.lineTo(pos.x + s, pos.y - s * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y - s * 0.2);
      ctx.lineTo(pos.x - s, pos.y + s);
      ctx.lineTo(pos.x - s * 0.2, pos.y + s);
      ctx.stroke();
      break;
  }
  ctx.restore();
};
