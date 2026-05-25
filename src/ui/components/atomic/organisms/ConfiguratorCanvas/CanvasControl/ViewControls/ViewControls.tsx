"use client";

import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, type ComponentRef } from "react";
import { useFrame } from "@react-three/fiber";

import { orbitFlag, orbitControlsRef } from "@utils";

const MIN_DISTANCE = 0.5;
const MAX_DISTANCE = 3;
const ROTATE_STEP = Math.PI;
const ZOOM_FACTOR = 0.8;
const LERP = 0.1;
const SNAP_THRESHOLD = 0.001;
const HOLD_SPEED = 0.025;

type CameraDirection = 1 | -1;

type CameraHandlers = {
  rotate: (direction: CameraDirection) => void;
  zoom: (direction: CameraDirection) => void;
  startRotate: (direction: CameraDirection) => void;
  stopRotate: () => void;
};

const noopHandlers: CameraHandlers = {
  rotate: () => {},
  zoom: () => {},
  startRotate: () => {},
  stopRotate: () => {},
};

const handlersRef: { current: CameraHandlers } = { current: noopHandlers };

const cameraBridge: CameraHandlers = {
  rotate: (direction) => handlersRef.current.rotate(direction),
  zoom: (direction) => handlersRef.current.zoom(direction),
  startRotate: (direction) => handlersRef.current.startRotate(direction),
  stopRotate: () => handlersRef.current.stopRotate(),
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
    orbitControlsRef.current = orbitRef.current;
    orbitRef.current.enabled = orbitFlag.enabled && !orbitFlag.nameToolActive;
    const orbit = orbitRef.current;
    const anim = animRef.current;

    if (anim.holdRotate !== 0) {
      const current = orbit.getAzimuthalAngle();
      const next = current + anim.holdRotate * HOLD_SPEED;
      orbit.setAzimuthalAngle(next);
      anim.rotate.targetAngle = next;
      anim.rotate.active = false;
      orbit.update();
    } else if (anim.rotate.active) {
      const current = orbit.getAzimuthalAngle();
      let diff = anim.rotate.targetAngle - current;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;

      if (Math.abs(diff) < SNAP_THRESHOLD) {
        orbit.setAzimuthalAngle(anim.rotate.targetAngle);
        anim.rotate.active = false;
      } else {
        orbit.setAzimuthalAngle(current + diff * LERP);
      }
      orbit.update();
    }

    if (anim.zoom.active) {
      const { object: camera, target } = orbit;
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
      orbit.update();
    }
  });

  useEffect(() => {
    handlersRef.current = {
      rotate: (direction) => {
        if (!orbitRef.current) return;
        const currentAngle = animRef.current.rotate.active
          ? animRef.current.rotate.targetAngle
          : orbitRef.current.getAzimuthalAngle();
        animRef.current.rotate.targetAngle =
          currentAngle + direction * ROTATE_STEP;
        animRef.current.rotate.active = true;
      },
      zoom: (direction) => {
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
      },
      startRotate: (direction) => {
        animRef.current.holdRotate = direction;
      },
      stopRotate: () => {
        animRef.current.holdRotate = 0;
      },
    };
    return () => {
      handlersRef.current = noopHandlers;
    };
  }, []);

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      makeDefault
      onStart={() => {
        animRef.current.rotate.active = false;
        animRef.current.holdRotate = 0;
        animRef.current.zoom.active = false;
      }}
    />
  );
};

export { ViewControls, cameraBridge };
