'use client';

import * as THREE from 'three';

import { useConfiguratorStore } from '@store';
import { TEXTURE_SIZE_EDITOR } from '@utils';

import { DesignTextureEngine, type DragPreview } from './designTextureEngine';

const threeInvalidators = new Set<() => void>();

const registerDesignRenderInvalidate = (fn: () => void): (() => void) => {
  threeInvalidators.add(fn);
  return () => threeInvalidators.delete(fn);
};

const requestThreeRender = () => {
  for (const fn of threeInvalidators) fn();
};

let storeSubscribed = false;
let designDragActive = false;
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
  useConfiguratorStore.subscribe(() => {
    if (designDragActive) return;
    engine?.scheduleRedraw();
  });
};

const initEngine = (): DesignTextureEngine => {
  if (!engine) {
    const resolution = useConfiguratorStore.getState().textureSettings.resolution ?? TEXTURE_SIZE_EDITOR;
    engine = new DesignTextureEngine(resolution, requestThreeRender);
    ensureStoreSubscription();
  }
  return engine;
};

const setDesignDragPreview = (preview: DragPreview | null): void => {
  designDragActive = preview !== null;
  initEngine().setDragPreview(preview);
};

const setDesignInteracting = (active: boolean): void => {
  initEngine().setInteracting(active);
};

const clearDesignDragPreview = (): void => {
  designDragActive = false;
  engine?.setDragPreview(null);
};

const acquireDesignEngine = (): void => {
  engineRefCount++;
  initEngine();
  notifyDesignEngineListeners();
};

const releaseDesignEngine = (): void => {
  engineRefCount = Math.max(0, engineRefCount - 1);
  if (engineRefCount === 0) {
    engine?.dispose();
    engine = null;
    storeSubscribed = false;
  }
  notifyDesignEngineListeners();
};

const getDesignEngineTexture = (zone: Parameters<DesignTextureEngine['getTexture']>[0]): THREE.CanvasTexture | null => {
  return engine?.getTexture(zone) ?? null;
};

export {
  acquireDesignEngine,
  clearDesignDragPreview,
  getDesignEngineTexture,
  initEngine,
  registerDesignRenderInvalidate,
  releaseDesignEngine,
  requestThreeRender,
  setDesignDragPreview,
  setDesignInteracting,
  subscribeDesignEngine,
};
