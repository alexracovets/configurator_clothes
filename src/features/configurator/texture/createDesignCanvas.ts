import Konva from "konva";
import { TEXTURE_SIZE_EDITOR } from "./textureConstants";

export interface DesignCanvasResult {
  stage: Konva.Stage;
  layers: {
    numbers: Konva.Layer;
    names:   Konva.Layer;
    logos:   Konva.Layer;
  };
  /** DOM container that Konva created — keep it hidden off-screen */
  container: HTMLDivElement;
  dispose: () => void;
}

/**
 * Creates an off-screen Konva Stage that acts as the design editor.
 * The Stage is NOT mounted inside the React tree — it lives in a hidden div.
 * Call dispose() when you no longer need it to free GPU / DOM resources.
 */
export function createDesignCanvas(
  size = TEXTURE_SIZE_EDITOR,
): DesignCanvasResult {
  // Hidden container (Konva requires a DOM element)
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:" + size + "px;height:" + size + "px;overflow:hidden;";
  document.body.appendChild(container);

  const stage = new Konva.Stage({ container, width: size, height: size });

  const numbersLayer = new Konva.Layer({ name: "numbers" });
  const namesLayer   = new Konva.Layer({ name: "names" });
  const logosLayer   = new Konva.Layer({ name: "logos" });

  stage.add(numbersLayer);
  stage.add(namesLayer);
  stage.add(logosLayer);

  const dispose = () => {
    stage.destroy();
    if (container.parentNode) container.parentNode.removeChild(container);
  };

  return {
    stage,
    layers: { numbers: numbersLayer, names: namesLayer, logos: logosLayer },
    container,
    dispose,
  };
}
