import { useEffect, useState } from "react";
import * as THREE from "three";

const SVG_RENDER_WIDTH = 4096;
const SVG_RENDER_HEIGHT = 2048;

type LoadedTexture = { url: string; texture: THREE.Texture };

export const useSvgTexture = (url: string): THREE.Texture | null => {
  const [loaded, setLoaded] = useState<LoadedTexture | null>(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    fetch(url)
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) return;

        const blob = new Blob([svgText], { type: "image/svg+xml" });
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image(SVG_RENDER_WIDTH, SVG_RENDER_HEIGHT);
        img.onload = () => {
          if (cancelled) {
            URL.revokeObjectURL(objectUrl);
            return;
          }

          const canvas = document.createElement("canvas");
          canvas.width = SVG_RENDER_WIDTH;
          canvas.height = SVG_RENDER_HEIGHT;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, SVG_RENDER_WIDTH, SVG_RENDER_HEIGHT);
          URL.revokeObjectURL(objectUrl);

          const tex = new THREE.CanvasTexture(canvas);
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.flipY = false;
          tex.needsUpdate = true;
          setLoaded({ url, texture: tex });
        };
        img.src = objectUrl;
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return loaded?.url === url ? loaded.texture : null;
};
