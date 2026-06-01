import * as THREE from 'three';

import { useStepsStore } from '@store';
import { buildLayerLayout, hitTestLayout, isLayerEditableOnStep, UV0_BOUNDS } from '@utils';
import type { PrintZoneKey } from '@types';

interface HitState {
  selectedId: string | null;
  layers: Array<{
    id: string;
    zone: PrintZoneKey;
    visible: boolean;
    type: string;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    locked?: boolean;
    interactive?: boolean;
    text?: string;
    fontSize?: number;
  }>;
}

type GizmoZone = 'copy' | 'delete' | 'rotate' | 'resize' | 'body' | null;

const zoneFromName = (name: string): PrintZoneKey | null => {
  const n = (name ?? '').toLowerCase();
  if (n.includes('back')) return 'back';
  if (n.includes('front')) return 'front';
  if (n.includes('sleeve_left') || (n.includes('sleeve') && n.includes('left'))) return 'sleeve_left';
  if (n.includes('sleeve_right') || (n.includes('sleeve') && n.includes('right'))) return 'sleeve_right';
  if (n.includes('_left') || n.endsWith('left')) return 'left';
  if (n.includes('_right') || n.endsWith('right')) return 'right';
  return null;
};

const normaliseUV = (uvX: number, uvY: number, zone: PrintZoneKey) => {
  const b = UV0_BOUNDS[zone];
  return { nx: (uvX - b.minX) / (b.maxX - b.minX), ny: (uvY - b.minY) / (b.maxY - b.minY) };
};

const _ray = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

let _cachedScene: THREE.Scene | null = null;
let _cachedMeshes: THREE.Mesh[] = [];

const getSceneMeshes = (scene: THREE.Scene): THREE.Mesh[] => {
  if (scene !== _cachedScene) {
    _cachedMeshes = [];
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh) || !o.geometry?.attributes?.uv) return;
      if (!zoneFromName(o.name)) return;
      _cachedMeshes.push(o);
    });
    _cachedScene = scene;
  }
  return _cachedMeshes;
};

const _worldNormal = new THREE.Vector3();

const frontSurfaceHits = (hits: THREE.Intersection[]): THREE.Intersection[] => {
  if (hits.length === 0) return hits;
  const minDistance = hits[0].distance;
  const epsilon = Math.max(0.002, minDistance * 0.02);
  const out: THREE.Intersection[] = [];
  for (const hit of hits) {
    if (hit.distance > minDistance + epsilon) break;
    if (!hit.face) continue;
    _worldNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld).normalize();
    if (_worldNormal.dot(_ray.ray.direction) > 0) continue;
    out.push(hit);
  }
  return out;
};

const getHits = (e: PointerEvent, gl: THREE.WebGLRenderer, camera: THREE.Camera, scene: THREE.Scene): Array<{ uv: THREE.Vector2; zone: PrintZoneKey }> => {
  const rect = gl.domElement.getBoundingClientRect();
  _ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * -2 + 1);
  _ray.setFromCamera(_ndc, camera);
  const meshes = getSceneMeshes(scene);
  const out: Array<{ uv: THREE.Vector2; zone: PrintZoneKey }> = [];
  for (const hit of frontSurfaceHits(_ray.intersectObjects(meshes, false))) {
    if (!hit.uv) continue;
    const zone = zoneFromName((hit.object as THREE.Mesh).name);
    if (zone) out.push({ uv: hit.uv.clone(), zone });
  }
  return out;
};

let _hitCanvas: HTMLCanvasElement | null = null;
const getHitCanvas = (): HTMLCanvasElement => {
  if (!_hitCanvas && typeof document !== 'undefined') {
    _hitCanvas = document.createElement('canvas');
    _hitCanvas.width = 512;
    _hitCanvas.height = 512;
  }
  return _hitCanvas!;
};

const atlasHitTestZone = (
  nx: number,
  ny: number,
  zone: PrintZoneKey,
  state: HitState,
  ctx: CanvasRenderingContext2D,
  size: number,
): { id: string; gizmoZone: GizmoZone } | null => {
  const selectedId = state.selectedId;
  const activeStep = useStepsStore.getState().currentStepValue;
  const layers = state.layers.filter(
    (l) => l.zone === zone && l.visible && isLayerEditableOnStep(l as Parameters<typeof isLayerEditableOnStep>[0], activeStep),
  );
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    if (l.interactive === false) continue;
    const layout = buildLayerLayout(ctx, l as Parameters<typeof buildLayerLayout>[1], size);
    if (l.id === selectedId) {
      const gz = hitTestLayout(nx, ny, layout, size);
      if (gz !== null) return { id: l.id, gizmoZone: gz };
    } else {
      const gz = hitTestLayout(nx, ny, layout, size);
      if (gz === 'body') return { id: l.id, gizmoZone: 'body' };
    }
  }
  return null;
};

const atlasHitTest = (uvX: number, uvY: number, zone: PrintZoneKey, state: HitState) => {
  const canvas = getHitCanvas();
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const size = canvas.width;

  // 1. Test logo layers — they live in 'full' zone, raw UV0 coords (no normalisation)
  const logoResult = atlasHitTestZone(uvX, uvY, 'full' as PrintZoneKey, state, ctx, size);
  if (logoResult) return logoResult;

  // 2. Test text/number layers — normalised per-zone
  const { nx, ny } = normaliseUV(uvX, uvY, zone);
  if (nx < -0.15 || nx > 1.15 || ny < -0.15 || ny > 1.15) return null;
  return atlasHitTestZone(nx, ny, zone, state, ctx, size);
};

const getHitOnMesh = (
  e: PointerEvent,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  scene: THREE.Scene,
  meshName: string,
): { uv: THREE.Vector2; zone: PrintZoneKey } | null => {
  const rect = gl.domElement.getBoundingClientRect();
  _ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * -2 + 1);
  _ray.setFromCamera(_ndc, camera);
  const meshes = getSceneMeshes(scene).filter((m) => m.name === meshName);
  for (const hit of frontSurfaceHits(_ray.intersectObjects(meshes, false))) {
    if (!hit.uv) continue;
    const zone = zoneFromName((hit.object as THREE.Mesh).name);
    if (zone) return { uv: hit.uv.clone(), zone };
  }
  return null;
};

const findLayerHit = (hits: Array<{ uv: THREE.Vector2; zone: PrintZoneKey }>, state: HitState) => {
  for (const { uv, zone } of hits) {
    const result = atlasHitTest(uv.x, uv.y, zone, state);
    if (result) return { result, uv, zone };
  }
  return null;
};

export { findLayerHit, getHitOnMesh, getHits, normaliseUV };
