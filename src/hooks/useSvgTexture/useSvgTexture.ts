import { useEffect, useState } from 'react';

import * as THREE from 'three';

import { requestThreeRender } from '@hooks';
import { SVG_RENDER_HEIGHT, SVG_RENDER_WIDTH } from '@constants';

const textureCache = new Map<string, THREE.Texture>();
const loadingPromises = new Map<string, Promise<THREE.Texture>>();

const loadSvgTexture = (url: string): Promise<THREE.Texture> => {
  if (textureCache.has(url)) return Promise.resolve(textureCache.get(url)!);
  if (loadingPromises.has(url)) return loadingPromises.get(url)!;

  const promise = fetch(url)
    .then((r) => r.text())
    .then(
      (svgText) =>
        new Promise<THREE.Texture>((resolve) => {
          const blob = new Blob([svgText], { type: 'image/svg+xml' });
          const objectUrl = URL.createObjectURL(blob);
          const img = new Image(SVG_RENDER_WIDTH, SVG_RENDER_HEIGHT);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const canvas = document.createElement('canvas');
            canvas.width = SVG_RENDER_WIDTH;
            canvas.height = SVG_RENDER_HEIGHT;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.flipY = false;
            tex.needsUpdate = true;
            textureCache.set(url, tex);
            loadingPromises.delete(url);
            resolve(tex);
          };
          img.src = objectUrl;
        }),
    );

  loadingPromises.set(url, promise);
  return promise;
};

const preloadSvgTextures = (urls: string[]): void => {
  for (const url of urls) loadSvgTexture(url);
};

const useSvgTexture = (url: string): THREE.Texture | null => {
  const [texture, setTexture] = useState<{ url: string; tex: THREE.Texture } | null>(() => {
    const cached = textureCache.get(url);
    return cached ? { url, tex: cached } : null;
  });

  useEffect(() => {
    if (!url) {
      requestThreeRender();
      return;
    }
    let cancelled = false;
    loadSvgTexture(url).then((tex) => {
      if (cancelled) return;
      setTexture({ url, tex });
      requestThreeRender();
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture?.url === url ? texture.tex : null;
};

export { preloadSvgTextures, useSvgTexture };
