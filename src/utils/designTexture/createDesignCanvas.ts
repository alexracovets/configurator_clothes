import Konva from 'konva';

import type { DesignCanvasResult } from '@types';

import { TEXTURE_SIZE_EDITOR } from './textureConstants';

export type { DesignCanvasResult };

const createDesignCanvas = (size = TEXTURE_SIZE_EDITOR): DesignCanvasResult => {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:' + size + 'px;height:' + size + 'px;overflow:hidden;';
  document.body.appendChild(container);
  const stage = new Konva.Stage({ container, width: size, height: size });
  const numbersLayer = new Konva.Layer({ name: 'numbers' });
  const namesLayer = new Konva.Layer({ name: 'names' });
  const logosLayer = new Konva.Layer({ name: 'logos' });
  stage.add(numbersLayer);
  stage.add(namesLayer);
  stage.add(logosLayer);
  const dispose = () => {
    stage.destroy();
    if (container.parentNode) container.parentNode.removeChild(container);
  };
  return { stage, layers: { numbers: numbersLayer, names: namesLayer, logos: logosLayer }, container, dispose };
};

export { createDesignCanvas };
