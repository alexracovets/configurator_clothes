'use client';

import { type ComponentRef, type MutableRefObject, useEffect, useRef } from 'react';

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { isOrbitControlsEnabled, orbitControlsRef } from '@utils';

const MIN_DISTANCE = 0.5;
const MAX_DISTANCE = 3;
const ROTATE_STEP = Math.PI;
const ZOOM_FACTOR = 0.8;
const LERP = 0.12;
const SNAP_THRESHOLD = 0.002;
const HOLD_SPEED = 0.04;

type CameraDirection = 1 | -1;

type AnimState = {
  rotate: {
    active: boolean;
    applied: number;
    target: number;
  };
  zoom: { active: boolean; targetDistance: number };
  holdRotate: 0 | 1 | -1;
};

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

const syncAppliedFromOrbit = (orbit: OrbitControlsImpl, anim: AnimState) => {
  anim.rotate.applied = orbit.getAzimuthalAngle();
};

const cancelButtonRotation = (orbit: OrbitControlsImpl, anim: AnimState) => {
  syncAppliedFromOrbit(orbit, anim);
  anim.rotate.target = anim.rotate.applied;
  anim.rotate.active = false;
  anim.holdRotate = 0;
};

const addButtonRotation = (orbit: OrbitControlsImpl, anim: AnimState, delta: number) => {
  const { rotate } = anim;
  if (!rotate.active) {
    syncAppliedFromOrbit(orbit, anim);
  }
  rotate.target = rotate.active ? rotate.target : rotate.applied;
  rotate.target += delta;
  rotate.active = true;
};

const stepButtonRotation = (orbit: OrbitControlsImpl, anim: AnimState, programmaticMoveRef: MutableRefObject<boolean>) => {
  const { rotate } = anim;
  const diff = rotate.target - rotate.applied;

  programmaticMoveRef.current = true;
  if (Math.abs(diff) < SNAP_THRESHOLD) {
    rotate.applied = rotate.target;
    orbit.setAzimuthalAngle(rotate.applied);
    rotate.active = false;
  } else {
    rotate.applied += diff * LERP;
    orbit.setAzimuthalAngle(rotate.applied);
  }
  orbit.update();
  programmaticMoveRef.current = false;
};

const ViewControls = () => {
  const orbitRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const invalidate = useThree((s) => s.invalidate);
  const programmaticMoveRef = useRef(false);

  const animRef = useRef<AnimState>({
    rotate: {
      active: false,
      applied: 0,
      target: 0,
    },
    zoom: { active: false, targetDistance: -1 },
    holdRotate: 0,
  });

  useFrame(() => {
    if (!orbitRef.current) return;
    orbitControlsRef.current = orbitRef.current;
    orbitRef.current.enabled = isOrbitControlsEnabled();
    const orbit = orbitRef.current;
    const anim = animRef.current;
    let needsRender = false;

    if (anim.holdRotate !== 0) {
      addButtonRotation(orbit, anim, anim.holdRotate * HOLD_SPEED);
    }

    if (anim.rotate.active) {
      stepButtonRotation(orbit, anim, programmaticMoveRef);
      needsRender = true;
    }

    if (anim.zoom.active) {
      const { object: camera, target } = orbit;
      const toTarget = camera.position.clone().sub(target);
      const currentDist = toTarget.length();
      const diff = anim.zoom.targetDistance - currentDist;

      programmaticMoveRef.current = true;
      if (Math.abs(diff) < SNAP_THRESHOLD) {
        toTarget.normalize().multiplyScalar(anim.zoom.targetDistance);
        camera.position.copy(target).add(toTarget);
        anim.zoom.active = false;
      } else {
        toTarget.normalize().multiplyScalar(currentDist + diff * LERP);
        camera.position.copy(target).add(toTarget);
      }
      orbit.update();
      programmaticMoveRef.current = false;
      needsRender = true;
    }

    const animRunning = anim.holdRotate !== 0 || anim.rotate.active || anim.zoom.active;
    if (needsRender || animRunning) invalidate();
  });

  useEffect(() => {
    handlersRef.current = {
      rotate: (direction) => {
        const orbit = orbitRef.current;
        if (!orbit) return;
        addButtonRotation(orbit, animRef.current, direction * ROTATE_STEP);
        invalidate();
      },
      zoom: (direction) => {
        if (!orbitRef.current) return;
        const { object: camera, target } = orbitRef.current;
        const anim = animRef.current;
        const currentDist = anim.zoom.active ? anim.zoom.targetDistance : camera.position.distanceTo(target);
        const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
        anim.zoom.targetDistance = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, currentDist * factor));
        anim.zoom.active = true;
        invalidate();
      },
      startRotate: (direction) => {
        animRef.current.holdRotate = direction;
        invalidate();
      },
      stopRotate: () => {
        animRef.current.holdRotate = 0;
      },
    };
    return () => {
      handlersRef.current = noopHandlers;
    };
  }, [invalidate]);

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      enableDamping={false}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      makeDefault
      onChange={() => invalidate()}
      onStart={() => {
        if (programmaticMoveRef.current) return;
        const orbit = orbitRef.current;
        if (orbit) cancelButtonRotation(orbit, animRef.current);
        animRef.current.zoom.active = false;
        invalidate();
      }}
    />
  );
};

export { cameraBridge, ViewControls };
