'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import * as THREE from 'three';

import type { ConfiguratorPart } from '@types';

import { acquireDesignEngine, getDesignEngineTexture, initEngine, releaseDesignEngine, subscribeDesignEngine } from '../useDesignTexture/designTextureSession';

const SSR_DUMMY_TEXTURE =
  typeof document !== 'undefined' ? new THREE.CanvasTexture(document.createElement('canvas')) : (null as unknown as THREE.CanvasTexture);

const usePartAtlas = (part: ConfiguratorPart): THREE.CanvasTexture => {
  const texture = useSyncExternalStore(
    subscribeDesignEngine,
    () => getDesignEngineTexture(part) ?? SSR_DUMMY_TEXTURE,
    () => SSR_DUMMY_TEXTURE,
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    acquireDesignEngine();
    return () => releaseDesignEngine();
  }, []);

  return texture;
};

const useInvalidatePartAtlas = (): (() => void) => {
  return useCallback(() => {
    initEngine().invalidate();
  }, []);
};

export { useInvalidatePartAtlas, usePartAtlas };
