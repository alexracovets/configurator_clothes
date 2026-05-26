import * as THREE from "three";

import { UV0_BOUNDS } from "../texture/textureConstants";
import type { PrintZoneKey } from "../texture/textureConstants";
import { buildLayerLayout, hitTestLayout } from "../hooks/useDesignTexture";
import { useConfiguratorStore } from "../store/configurator.store";

// Resolve PrintZoneKey from mesh node name
export function zoneFromName(name: string): PrintZoneKey | null {
  const n = (name ?? "").toLowerCase();
  if (n.includes("back"))                                                          return "back";
  if (n.includes("front"))                                                         return "front";
  if (n.includes("sleeve_left")  || (n.includes("sleeve") && n.includes("left")))  return "sleeve_left";
  if (n.includes("sleeve_right") || (n.includes("sleeve") && n.includes("right"))) return "sleeve_right";
  return null;
}

// Resolve PrintZoneKey from UV0 position in atlas
export function zoneFromUV(uvX: number, uvY: number): PrintZoneKey | null {
  for (const [zone, b] of Object.entries(UV0_BOUNDS) as [PrintZoneKey, typeof UV0_BOUNDS[PrintZoneKey]][]) {
    if (uvX >= b.minX && uvX <= b.maxX && uvY >= b.minY && uvY <= b.maxY) {
      return zone;
    }
  }
  return null;
}

// Normalise raw UV0 → [0,1] within zone bounds
export function normaliseUV(uvX: number, uvY: number, zone: PrintZoneKey) {
  const b = UV0_BOUNDS[zone];
  return {
    nx: (uvX - b.minX) / (b.maxX - b.minX),
    ny: (uvY - b.minY) / (b.maxY - b.minY),
  };
}

// Reuse raycaster and NDC vector across calls to avoid per-frame allocations
const _ray = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

// Cached mesh list — invalidated when scene changes
let _cachedScene: THREE.Scene | null = null;
let _cachedMeshes: THREE.Mesh[] = [];

function getSceneMeshes(scene: THREE.Scene): THREE.Mesh[] {
  if (scene !== _cachedScene) {
    _cachedMeshes = [];
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh && o.geometry?.attributes?.uv) _cachedMeshes.push(o);
    });
    _cachedScene = scene;
  }
  return _cachedMeshes;
}

export function invalidateMeshCache() {
  _cachedScene = null;
}

// Raycaster → all candidate zone hits
export function getHits(
  e: PointerEvent,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  scene: THREE.Scene,
): Array<{ uv: THREE.Vector2; zone: PrintZoneKey }> {
  const rect = gl.domElement.getBoundingClientRect();
  _ndc.set(
    ((e.clientX - rect.left) / rect.width)  *  2 - 1,
    ((e.clientY - rect.top)  / rect.height) * -2 + 1,
  );
  _ray.setFromCamera(_ndc, camera);

  const meshes = getSceneMeshes(scene);
  const out: Array<{ uv: THREE.Vector2; zone: PrintZoneKey }> = [];
  for (const hit of _ray.intersectObjects(meshes, false)) {
    if (!hit.uv) continue;
    const mesh = hit.object as THREE.Mesh;
    const zone = zoneFromName(mesh.name) ?? zoneFromUV(hit.uv.x, hit.uv.y);
    if (zone) out.push({ uv: hit.uv.clone(), zone });
  }
  return out;
}

/** Raycast only meshes belonging to one print zone (cheaper during drag). */
export function getHitInZone(
  e: PointerEvent,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  scene: THREE.Scene,
  zone: PrintZoneKey,
): { uv: THREE.Vector2; zone: PrintZoneKey } | null {
  const rect = gl.domElement.getBoundingClientRect();
  _ndc.set(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    ((e.clientY - rect.top) / rect.height) * -2 + 1,
  );
  _ray.setFromCamera(_ndc, camera);

  const meshes = getSceneMeshes(scene).filter((mesh) => zoneFromName(mesh.name) === zone);
  for (const hit of _ray.intersectObjects(meshes, false)) {
    if (!hit.uv) continue;
    return { uv: hit.uv, zone };
  }
  return null;
}

// Shared offscreen canvas for hit-test layout computations
let _hitCanvas: HTMLCanvasElement | null = null;
function getHitCanvas(): HTMLCanvasElement {
  if (!_hitCanvas && typeof document !== "undefined") {
    _hitCanvas = document.createElement("canvas");
    _hitCanvas.width  = 512;
    _hitCanvas.height = 512;
  }
  return _hitCanvas!;
}

// Hit-test a UV point against layers in zone; returns layer id and gizmo zone
export function atlasHitTest(uvX: number, uvY: number, zone: PrintZoneKey) {
  const { nx, ny } = normaliseUV(uvX, uvY, zone);
  // Allow wider range so handles outside textBox are reachable
  if (nx < -0.15 || nx > 1.15 || ny < -0.15 || ny > 1.15) return null;

  const state      = useConfiguratorStore.getState();
  const selectedId = state.selectedId;
  const layers     = state.layers.filter(
    (l) => l.zone === zone && l.visible && (l.type === "text" || l.type === "number")
  );

  const canvas = getHitCanvas();
  const ctx    = canvas.getContext("2d");
  if (!ctx) return null;
  const size = canvas.width;

  for (let i = layers.length - 1; i >= 0; i--) {
    const l      = layers[i];
    const layout = buildLayerLayout(ctx, l, size);

    if (l.id === selectedId) {
      const gizmoZone = hitTestLayout(nx, ny, layout, size);
      if (gizmoZone !== null) return { id: l.id, gizmoZone };
    } else {
      const gizmoZone = hitTestLayout(nx, ny, layout, size);
      if (gizmoZone === "body") return { id: l.id, gizmoZone: "body" as const };
    }
  }
  return null;
}

// Find first hit that matches any layer across all candidate zones
export function findLayerHit(hits: Array<{ uv: THREE.Vector2; zone: PrintZoneKey }>) {
  for (const { uv, zone } of hits) {
    const result = atlasHitTest(uv.x, uv.y, zone);
    if (result) return { result, uv, zone };
  }
  return null;
}
