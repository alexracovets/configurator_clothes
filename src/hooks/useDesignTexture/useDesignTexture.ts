'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import * as THREE from 'three';

import type { PrintZoneKey } from '@types';

import { acquireDesignEngine, getDesignEngineTexture, initEngine, releaseDesignEngine, subscribeDesignEngine } from './designTextureSession';

const SSR_DUMMY_TEXTURE =
  typeof document !== 'undefined' ? new THREE.CanvasTexture(document.createElement('canvas')) : (null as unknown as THREE.CanvasTexture);

const useDesignTexture = (zone: PrintZoneKey): { texture: THREE.CanvasTexture; invalidate: () => void } => {
  const texture = useSyncExternalStore(
    subscribeDesignEngine,
    () => getDesignEngineTexture(zone) ?? SSR_DUMMY_TEXTURE,
    () => SSR_DUMMY_TEXTURE,
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    acquireDesignEngine();
    return () => releaseDesignEngine();
  }, []);

  const invalidate = useCallback(() => {
    initEngine().invalidate();
  }, []);

  return { texture, invalidate };
};

export { useDesignTexture };
