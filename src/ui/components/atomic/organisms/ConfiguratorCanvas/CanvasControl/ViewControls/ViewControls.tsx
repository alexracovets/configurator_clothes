"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ComponentRef } from "react";

const MIN_DISTANCE = 0.5;
const MAX_DISTANCE = 3;
const ROTATE_STEP = Math.PI / 8;
const ZOOM_FACTOR = 0.8;
const LERP = 0.1;
const SNAP_THRESHOLD = 0.001;
const HOLD_SPEED = 0.025;

const cameraBridge = {
  rotate: (_dir: 1 | -1) => {},
  zoom: (_dir: 1 | -1) => {},
  startRotate: (_dir: 1 | -1) => {},
  stopRotate: () => {},
};

const ViewControls = () => {
  const orbitRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  const animRef = useRef({
    rotate: { active: false, targetAngle: 0 },
    zoom: { active: false, targetDistance: -1 },
    holdRotate: 0 as 0 | 1 | -1,
  });

  useFrame(() => {
    if (!orbitRef.current) return;
    const { object: camera, target } = orbitRef.current;
    const anim = animRef.current;
    let needsUpdate = false;

    if (anim.holdRotate !== 0) {
      const dx = camera.position.x - target.x;
      const dz = camera.position.z - target.z;
      const radius = Math.sqrt(dx * dx + dz * dz);
      const currentAngle = Math.atan2(dx, dz);
      const newAngle = currentAngle + anim.holdRotate * HOLD_SPEED;
      camera.position.x = target.x + Math.sin(newAngle) * radius;
      camera.position.z = target.z + Math.cos(newAngle) * radius;
      camera.lookAt(target);
      anim.rotate.targetAngle = newAngle;
      anim.rotate.active = false;
      needsUpdate = true;
    } else if (anim.rotate.active) {
      const dx = camera.position.x - target.x;
      const dz = camera.position.z - target.z;
      const radius = Math.sqrt(dx * dx + dz * dz);
      const currentAngle = Math.atan2(dx, dz);

      let diff = anim.rotate.targetAngle - currentAngle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;

      if (Math.abs(diff) < SNAP_THRESHOLD) {
        camera.position.x =
          target.x + Math.sin(anim.rotate.targetAngle) * radius;
        camera.position.z =
          target.z + Math.cos(anim.rotate.targetAngle) * radius;
        anim.rotate.active = false;
      } else {
        const newAngle = currentAngle + diff * LERP;
        camera.position.x = target.x + Math.sin(newAngle) * radius;
        camera.position.z = target.z + Math.cos(newAngle) * radius;
      }
      camera.lookAt(target);
      needsUpdate = true;
    }

    if (anim.zoom.active) {
      const toTarget = camera.position.clone().sub(target);
      const currentDist = toTarget.length();
      const diff = anim.zoom.targetDistance - currentDist;

      if (Math.abs(diff) < SNAP_THRESHOLD) {
        toTarget.normalize().multiplyScalar(anim.zoom.targetDistance);
        camera.position.copy(target).add(toTarget);
        anim.zoom.active = false;
      } else {
        toTarget.normalize().multiplyScalar(currentDist + diff * LERP);
        camera.position.copy(target).add(toTarget);
      }
      needsUpdate = true;
    }

    if (needsUpdate) orbitRef.current.update();
  });

  cameraBridge.rotate = (direction) => {
    if (!orbitRef.current) return;
    const { object: camera, target } = orbitRef.current;
    const dx = camera.position.x - target.x;
    const dz = camera.position.z - target.z;
    const currentAngle = animRef.current.rotate.active
      ? animRef.current.rotate.targetAngle
      : Math.atan2(dx, dz);
    animRef.current.rotate.targetAngle = currentAngle + direction * ROTATE_STEP;
    animRef.current.rotate.active = true;
  };

  cameraBridge.zoom = (direction) => {
    if (!orbitRef.current) return;
    const { object: camera, target } = orbitRef.current;
    const currentDist = animRef.current.zoom.active
      ? animRef.current.zoom.targetDistance
      : camera.position.distanceTo(target);
    const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    animRef.current.zoom.targetDistance = Math.max(
      MIN_DISTANCE,
      Math.min(MAX_DISTANCE, currentDist * factor),
    );
    animRef.current.zoom.active = true;
  };

  cameraBridge.startRotate = (direction) => {
    animRef.current.holdRotate = direction;
  };

  cameraBridge.stopRotate = () => {
    animRef.current.holdRotate = 0;
  };

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      makeDefault
    />
  );
};

export { ViewControls, cameraBridge };
