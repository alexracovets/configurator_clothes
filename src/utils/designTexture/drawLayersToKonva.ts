import Konva from 'konva';

import type { DesignLayer } from '@types';

import { fontCanvasName } from '../fontDecal';
import type { DesignCanvasResult } from './createDesignCanvas';
import { TEXTURE_SIZE_EDITOR } from './textureConstants';

const drawLayersToKonva = (dc: DesignCanvasResult, layers: DesignLayer[]): void => {
  const size = dc.stage.width();
  dc.layers.numbers.destroyChildren();
  dc.layers.names.destroyChildren();
  dc.layers.logos.destroyChildren();

  for (const layer of layers) {
    if (!layer.visible) continue;
    const px = layer.x * size;
    const py = layer.y * size;

    switch (layer.type) {
      case 'number':
      case 'text': {
        const text = layer.text ?? (layer.type === 'number' ? '9' : 'NAME');
        const font = fontCanvasName(layer.font ?? '--font-oswald');
        const fontSize = Math.round((layer.fontSize ?? 128) * (size / TEXTURE_SIZE_EDITOR));
        const strokeWidth = (layer.strokeWidth ?? 4) * (size / TEXTURE_SIZE_EDITOR);
        const kText = new Konva.Text({
          x: px,
          y: py,
          text,
          fontFamily: font,
          fontStyle: 'bold',
          fontSize,
          fill: layer.textColor ?? '#FFFFFF',
          stroke: layer.strokeColor ?? '#1A2744',
          strokeWidth,
          align: 'center',
          rotation: layer.rotation,
          offsetX: 0,
          offsetY: 0,
          listening: false,
          perfectDrawEnabled: true,
        });
        kText.offsetX(kText.width() / 2);
        kText.offsetY(kText.height() / 2);
        const targetLayer = layer.type === 'number' ? dc.layers.numbers : dc.layers.names;
        targetLayer.add(kText);
        break;
      }
      case 'logo': {
        if (!layer.src) break;
        const img = new window.Image();
        img.onload = () => {
          const scaleX = (layer.scaleX * size) / img.width;
          const scaleY = (layer.scaleY * size) / img.height;
          const kImg = new Konva.Image({
            x: px,
            y: py,
            image: img,
            scaleX,
            scaleY,
            rotation: layer.rotation,
            offsetX: img.width / 2,
            offsetY: img.height / 2,
            listening: false,
          });
          dc.layers.logos.add(kImg);
          dc.layers.logos.batchDraw();
        };
        img.src = layer.src;
        break;
      }
    }
  }

  dc.layers.numbers.batchDraw();
  dc.layers.names.batchDraw();
};

export { drawLayersToKonva };
