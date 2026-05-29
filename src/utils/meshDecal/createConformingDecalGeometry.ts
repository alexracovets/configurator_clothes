import * as THREE from "three";
import { DecalGeometry } from "three-stdlib";

import { computeDecalOrientation } from "./computeDecalOrientation";

export interface ConformingDecalOptions {
  segmentsX?: number;
  segmentsY?: number;
  surfaceOffset?: number;
  minHitRatio?: number;
}

const _raycaster = new THREE.Raycaster();
const _projector = new THREE.Object3D();
const _projectorWorld = new THREE.Matrix4();
const _planePoint = new THREE.Vector3();
const _worldPoint = new THREE.Vector3();
const _rayStart = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _offsetWorld = new THREE.Vector3();
const _bbox = new THREE.Box3();
const _meshCenter = new THREE.Vector3();
const _radial = new THREE.Vector3();

const getMeshWorldCenter = (mesh: THREE.Mesh): THREE.Vector3 => {
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  _bbox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
  return _bbox.getCenter(_meshCenter);
};

const orientExteriorNormal = (
  normal: THREE.Vector3,
  worldPoint: THREE.Vector3,
  meshCenter: THREE.Vector3,
): THREE.Vector3 => {
  _radial.copy(worldPoint).sub(meshCenter);
  const n = normal.clone();
  if (_radial.lengthSq() > 1e-10) {
    _radial.normalize();
    if (n.dot(_radial) < 0) n.negate();
  }
  return n;
};

const resolveRotation = (
  mesh: THREE.Mesh,
  position: THREE.Vector3,
  rotation: number | [number, number, number] | THREE.Euler,
): THREE.Euler => {
  if (typeof rotation === "number") {
    return computeDecalOrientation(mesh, position, rotation);
  }
  if (Array.isArray(rotation)) {
    return new THREE.Euler(rotation[0], rotation[1], rotation[2]);
  }
  return rotation.clone();
};

const createFallbackDecalGeometry = (
  targetMesh: THREE.Mesh,
  position: THREE.Vector3,
  euler: THREE.Euler,
  scale: THREE.Vector3,
): THREE.BufferGeometry => {
  const matrixWorld = targetMesh.matrixWorld.clone();
  targetMesh.updateMatrixWorld(true);
  targetMesh.matrixWorld.identity();
  const geometry = new DecalGeometry(targetMesh, position, euler, scale);
  targetMesh.matrixWorld.copy(matrixWorld);
  return geometry;
};

type GridHit = {
  local: THREE.Vector3;
  normal: THREE.Vector3;
};

const pickHit = (
  targetMesh: THREE.Mesh,
  hits: THREE.Intersection[],
  meshCenter: THREE.Vector3,
): GridHit | null => {
  if (!hits.length || !hits[0].face) return null;

  const faceNormal = hits[0].face.normal.clone();
  faceNormal.transformDirection(targetMesh.matrixWorld);
  const exterior = orientExteriorNormal(faceNormal, hits[0].point, meshCenter);

  const local = hits[0].point.clone();
  targetMesh.worldToLocal(local);

  return { local, normal: exterior };
};

const castAlongDirection = (
  targetMesh: THREE.Mesh,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  meshCenter: THREE.Vector3,
  far: number,
): GridHit | null => {
  for (const sign of [1, -1] as const) {
    _rayDir.copy(direction).multiplyScalar(sign);
    _rayStart.copy(origin).addScaledVector(_rayDir, -0.02 * sign);
    _raycaster.set(_rayStart, _rayDir);
    _raycaster.far = far;
    _raycaster.near = 0;
    const hit = pickHit(targetMesh, _raycaster.intersectObject(targetMesh, false), meshCenter);
    if (hit) return hit;
  }
  return null;
};

/** Проєктор + радіальний промінь (краще на плечах / складках) */
const raycastOnSurface = (
  targetMesh: THREE.Mesh,
  worldHint: THREE.Vector3,
  castDir: THREE.Vector3,
  meshCenter: THREE.Vector3,
  far: number,
): GridHit | null => {
  const projectorHit = castAlongDirection(targetMesh, worldHint, castDir, meshCenter, far);
  if (projectorHit) return projectorHit;

  _radial.copy(worldHint).sub(meshCenter);
  if (_radial.lengthSq() < 1e-8) return null;
  _radial.normalize();

  const radialOrigin = worldHint.clone().addScaledVector(_radial, 0.06);
  return castAlongDirection(targetMesh, radialOrigin, _radial.clone().negate(), meshCenter, 0.25);
};

const fillGridGaps = (grid: (GridHit | null)[][], rows: number, cols: number): void => {
  for (let pass = 0; pass < 3; pass++) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col]) continue;

        const sumLocal = new THREE.Vector3();
        const sumNormal = new THREE.Vector3();
        let count = 0;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const r = row + dr;
            const c = col + dc;
            if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
            const n = grid[r][c];
            if (!n) continue;
            sumLocal.add(n.local);
            sumNormal.add(n.normal);
            count++;
          }
        }

        if (count > 0) {
          grid[row][col] = {
            local: sumLocal.divideScalar(count),
            normal: sumNormal.divideScalar(count).normalize(),
          };
        }
      }
    }
  }
};

export const createConformingDecalGeometry = (
  targetMesh: THREE.Mesh,
  position: THREE.Vector3 | [number, number, number],
  rotation: number | [number, number, number] | THREE.Euler,
  size: THREE.Vector3 | [number, number, number],
  options: ConformingDecalOptions = {},
): THREE.BufferGeometry => {
  const {
    segmentsX = 48,
    segmentsY = 18,
    surfaceOffset = 0.0035,
    minHitRatio = 0.35,
  } = options;

  const pos = Array.isArray(position)
    ? new THREE.Vector3(position[0], position[1], position[2])
    : position.clone();
  const scale = Array.isArray(size)
    ? new THREE.Vector3(size[0], size[1], size[2])
    : size.clone();
  const euler = resolveRotation(targetMesh, pos, rotation);

  _projector.position.copy(pos);
  _projector.rotation.copy(euler);
  _projector.updateMatrix();

  targetMesh.updateMatrixWorld(true);
  _projectorWorld.multiplyMatrices(targetMesh.matrixWorld, _projector.matrix);

  const meshCenter = getMeshWorldCenter(targetMesh);
  const castDir = new THREE.Vector3(0, 0, 1).transformDirection(_projectorWorld).normalize();
  const rayFar = scale.z + 0.12;

  const cols = segmentsX + 1;
  const rows = segmentsY + 1;
  const grid: (GridHit | null)[][] = [];
  let hitCount = 0;

  for (let row = 0; row < rows; row++) {
    const line: (GridHit | null)[] = [];
    const v = row / segmentsY;
    const ly = (v - 0.5) * scale.y;

    for (let col = 0; col < cols; col++) {
      const u = col / segmentsX;
      const lx = (u - 0.5) * scale.x;

      _planePoint.set(lx, ly, 0).applyMatrix4(_projector.matrix);
      _worldPoint.copy(_planePoint).applyMatrix4(targetMesh.matrixWorld);

      const hit = raycastOnSurface(targetMesh, _worldPoint, castDir, meshCenter, rayFar);
      line.push(hit);
      if (hit) hitCount++;
    }
    grid.push(line);
  }

  fillGridGaps(grid, rows, cols);

  hitCount = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col]) hitCount++;
    }
  }

  const total = cols * rows;
  if (hitCount / total < minHitRatio) {
    return createFallbackDecalGeometry(targetMesh, pos, euler, scale);
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indexMap: number[][] = [];

  const inverseWorld = targetMesh.matrixWorld.clone().invert();

  for (let row = 0; row < rows; row++) {
    const rowIndices: number[] = [];
    for (let col = 0; col < cols; col++) {
      const hit = grid[row][col];
      if (!hit) {
        rowIndices.push(-1);
        continue;
      }

      _offsetWorld.copy(hit.local).applyMatrix4(targetMesh.matrixWorld);
      _offsetWorld.addScaledVector(hit.normal, surfaceOffset);
      const local = _offsetWorld.clone().applyMatrix4(inverseWorld);

      const vertexIndex = positions.length / 3;
      rowIndices.push(vertexIndex);

      positions.push(local.x, local.y, local.z);
      uvs.push(col / segmentsX, 1 - row / segmentsY);

      const localNormal = hit.normal.clone().transformDirection(inverseWorld).normalize();
      normals.push(localNormal.x, localNormal.y, localNormal.z);
    }
    indexMap.push(rowIndices);
  }

  const indices: number[] = [];
  const curvatureThreshold = 0.92;

  for (let row = 0; row < segmentsY; row++) {
    for (let col = 0; col < segmentsX; col++) {
      const a = indexMap[row][col];
      const b = indexMap[row][col + 1];
      const c = indexMap[row + 1][col];
      const d = indexMap[row + 1][col + 1];
      if (a < 0 || b < 0 || c < 0 || d < 0) continue;

      const na = new THREE.Vector3(normals[a * 3], normals[a * 3 + 1], normals[a * 3 + 2]);
      const nb = new THREE.Vector3(normals[b * 3], normals[b * 3 + 1], normals[b * 3 + 2]);
      const nc = new THREE.Vector3(normals[c * 3], normals[c * 3 + 1], normals[c * 3 + 2]);
      const nd = new THREE.Vector3(normals[d * 3], normals[d * 3 + 1], normals[d * 3 + 2]);

      const maxDot = Math.max(
        na.dot(nb),
        na.dot(nc),
        nb.dot(nd),
        nc.dot(nd),
      );

      if (maxDot >= curvatureThreshold) {
        indices.push(a, c, b, b, c, d);
        continue;
      }

      const pa = new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
      const pb = new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
      const pc = new THREE.Vector3(positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2]);
      const pd = new THREE.Vector3(positions[d * 3], positions[d * 3 + 1], positions[d * 3 + 2]);
      const ua = uvs[a * 2];
      const va = uvs[a * 2 + 1];
      const ub = uvs[b * 2];
      const vb = uvs[b * 2 + 1];
      const uc = uvs[c * 2];
      const vc = uvs[c * 2 + 1];
      const ud = uvs[d * 2];
      const vd = uvs[d * 2 + 1];

      const midP = pa.clone().add(pb).add(pc).add(pd).multiplyScalar(0.25);
      const midN = na.clone().add(nb).add(nc).add(nd).normalize();
      const midU = (ua + ub + uc + ud) * 0.25;
      const midV = (va + vb + vc + vd) * 0.25;

      const midIdx = positions.length / 3;
      positions.push(midP.x, midP.y, midP.z);
      uvs.push(midU, midV);
      normals.push(midN.x, midN.y, midN.z);

      indices.push(a, midIdx, b, b, midIdx, d, d, midIdx, c, c, midIdx, a);
    }
  }

  if (indices.length < 6) {
    return createFallbackDecalGeometry(targetMesh, pos, euler, scale);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
};
