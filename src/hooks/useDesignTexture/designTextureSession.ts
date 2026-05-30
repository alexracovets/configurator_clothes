'use client';

import * as THREE from 'three';

import { useConfiguratorStore } from '@store';
import { TEXTURE_SIZE_EDITOR } from '@utils';

import { DesignTextureEngine } from './designTextureEngine';

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
let engine: DesignTextureEngine | null = null;
let engineRefCount = 0;
const engineListeners = new Set<() => void>();

const notifyDesignEngineListeners = () => {
  for (const listener of engineListeners) listener();
};

const subscribeDesignEngine = (onStoreChange: () => void): (() => void) => {
  engineListeners.add(onStoreChange);
  return () => engineListeners.delete(onStoreChange);
};

const ensureStoreSubscription = () => {
  if (storeSubscribed || typeof document === 'undefined') return;
  storeSubscribed = true;
  storeUnsubscribe = useConfiguratorStore.subscribe(() => engine?.scheduleRedraw());
};

const initEngine = (): DesignTextureEngine => {
  if (!engine) {
    const resolution = useConfiguratorStore.getState().textureSettings.resolution ?? TEXTURE_SIZE_EDITOR;
    engine = new DesignTextureEngine(resolution, requestThreeRender);
    ensureStoreSubscription();
  }
  return engine;
};

const setDesignSlots = (zone: Parameters<DesignTextureEngine['setSlots']>[0], slots: Parameters<DesignTextureEngine['setSlots']>[1]): void => {
  initEngine().setSlots(zone, slots);
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
    storeUnsubscribe = null;
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
  releaseDesignEngine,
  requestThreeRender,
  setDesignInteracting,
  setDesignSlots,
  subscribeDesignEngine,
};
