import * as THREE from 'three';

const computeDecalOrientation = (mesh: THREE.Mesh, position: THREE.Vector3, rotZ = 0): THREE.Euler => {
  const geometry = mesh.geometry;
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }

  const vertices = geometry.attributes.position.array as ArrayLike<number>;
  const normals = geometry.attributes.normal.array as ArrayLike<number>;

  let distance = Infinity;
  let chosenIdx = -1;
  const ox = position.x;
  const oy = position.y;
  const oz = position.z;

  for (let i = 0; i < vertices.length; i += 3) {
    const xDiff = vertices[i] - ox;
    const yDiff = vertices[i + 1] - oy;
    const zDiff = vertices[i + 2] - oz;
    const distSquared = xDiff * xDiff + yDiff * yDiff + zDiff * zDiff;
    if (distSquared < distance) {
      distance = distSquared;
      chosenIdx = i;
    }
  }

  const helper = new THREE.Object3D();
  helper.position.copy(position);

  if (chosenIdx >= 0) {
    const closestNormal = new THREE.Vector3(normals[chosenIdx], normals[chosenIdx + 1], normals[chosenIdx + 2]);
    helper.lookAt(helper.position.clone().add(closestNormal));
    helper.rotateZ(Math.PI);
    helper.rotateY(Math.PI);
  }

  helper.rotateZ(rotZ);
  return helper.rotation.clone();
};

export { computeDecalOrientation };
