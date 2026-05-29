import type Konva from 'konva';

export interface DesignCanvasResult {
  stage: Konva.Stage;
  layers: { numbers: Konva.Layer; names: Konva.Layer; logos: Konva.Layer };
  container: HTMLDivElement;
  dispose: () => void;
}
