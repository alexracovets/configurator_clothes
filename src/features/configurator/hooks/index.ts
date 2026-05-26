export {
  useDesignTexture,
  useSharedDesignTexture,
  setDesignDragPreview,
  setDesignInteracting,
  clearDesignDragPreview,
  registerDesignRenderInvalidate,
  drawLayersDirect,
  buildLayerLayout,
  hitTestLayout,
  renderLayerGlyph,
} from "./useDesignTexture";
export type {
  GizmoHandle,
  GizmoZone,
  LayerLayout,
  LayerGlyph,
} from "./useDesignTexture";
export * from "./usePartDesignMaterial";
