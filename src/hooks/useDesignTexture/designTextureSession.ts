'use client';

import * as THREE from 'three';

import { useConfiguratorStore, useStepsStore } from '@store';
import type { PositionSlot } from '@utils';
import { TEXTURE_SIZE_EDITOR } from '@utils';
import type { StepValue } from '@constants';

import { DesignTextureEngine } from './designTextureEngine';

type PrintZoneKey = Parameters<DesignTextureEngine['setSlots']>[0];

const threeInvalidators = new Set<() => void>();

const registerDesignRenderInvalidate = (fn: () => void): (() => void) => {
  threeInvalidators.add(fn);
  return () => threeInvalidators.delete(fn);
};

const requestThreeRender = () => {
  for (const fn of threeInvalidators) fn();
};

let storeSubscribed = false;
let storeUnsubscribe: (() => void) | null = null;
let stepsUnsubscribe: (() => void) | null = null;
let engine: DesignTextureEngine | null = null;
let engineRefCount = 0;
const engineListeners = new Set<() => void>();

// Registry: step → zone → slots
const stepSlotsRegistry = new Map<StepValue, Map<PrintZoneKey, PositionSlot[]>>();

const notifyDesignEngineListeners = () => {
  for (const listener of engineListeners) listener();
};

const subscribeDesignEngine = (onStoreChange: () => void): (() => void) => {
  engineListeners.add(onStoreChange);
  return () => engineListeners.delete(onStoreChange);
};

const applyActiveStepSlots = (): void => {
  if (!engine) return;
  const activeStep = useStepsStore.getState().currentStepValue;
  const activeSlots = stepSlotsRegistry.get(activeStep);

  // Collect all zones that have registered slots across all steps
  const allZones = new Set<PrintZoneKey>();
  for (const zoneMap of stepSlotsRegistry.values()) {
    for (const zone of zoneMap.keys()) allZones.add(zone);
  }

  for (const zone of allZones) {
    const slots = activeSlots?.get(zone) ?? [];
    engine.setSlots(zone, slots);
  }
};

const ensureStoreSubscription = () => {
  if (storeSubscribed || typeof document === 'undefined') return;
  storeSubscribed = true;
  storeUnsubscribe = useConfiguratorStore.subscribe(() => engine?.scheduleRedraw());
  stepsUnsubscribe = useStepsStore.subscribe(applyActiveStepSlots);
};

const initEngine = (): DesignTextureEngine => {
  if (!engine) {
    const resolution = useConfiguratorStore.getState().textureSettings.resolution ?? TEXTURE_SIZE_EDITOR;
    engine = new DesignTextureEngine(resolution, requestThreeRender);
    ensureStoreSubscription();
  }
  return engine;
};

const registerStepSlots = (step: StepValue, zone: PrintZoneKey, slots: PositionSlot[]): (() => void) => {
  if (!stepSlotsRegistry.has(step)) stepSlotsRegistry.set(step, new Map());
  stepSlotsRegistry.get(step)!.set(zone, slots);
  initEngine();
  applyActiveStepSlots();
  return () => {
    stepSlotsRegistry.get(step)?.delete(zone);
    if (stepSlotsRegistry.get(step)?.size === 0) stepSlotsRegistry.delete(step);
    applyActiveStepSlots();
  };
};

const setDesignInteracting = (active: boolean): void => {
  initEngine().setInteracting(active);
};

const acquireDesignEngine = (): void => {
  engineRefCount++;
  initEngine();
  notifyDesignEngineListeners();
};

const releaseDesignEngine = (): void => {
  engineRefCount = Math.max(0, engineRefCount - 1);
  if (engineRefCount === 0) {
    storeUnsubscribe?.();
    stepsUnsubscribe?.();
    storeUnsubscribe = null;
    stepsUnsubscribe = null;
    storeSubscribed = false;
    engine?.dispose();
    engine = null;
  }
  notifyDesignEngineListeners();
};

const getDesignEngineTexture = (zone: Parameters<DesignTextureEngine['getTexture']>[0]): THREE.CanvasTexture | null => {
  return engine?.getTexture(zone) ?? null;
};

export {
  acquireDesignEngine,
  getDesignEngineTexture,
  initEngine,
  registerDesignRenderInvalidate,
  registerStepSlots,
  releaseDesignEngine,
  requestThreeRender,
  setDesignInteracting,
  subscribeDesignEngine,
};
