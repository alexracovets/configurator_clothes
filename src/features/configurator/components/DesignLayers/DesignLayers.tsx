"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useNameBridge }   from "../../bridges/useNameBridge";
import { useNumberBridge } from "../../bridges/useNumberBridge";
import { useConfiguratorStore } from "../../store/configurator.store";
import type { PrintZoneKey } from "../../texture/textureConstants";
import { getHits, findLayerHit, normaliseUV } from "../../utils/hitTest";

type DragMode = "body" | "rotate" | "resize";

const PointerHandler = () => {
  const { gl, camera, scene } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    let dragMode: DragMode | null     = null;
    let dragId:   string | null       = null;
    let dragZone: PrintZoneKey | null = null;

    let dragStartUV: THREE.Vector2 | null          = null;
    let dragStartXY: { x: number; y: number } | null = null;
    let dragStartClientX  = 0;
    let dragStartClientY  = 0;
    let dragStartRotation = 0;
    let dragStartFontSize = 0;

    let wasDrag = false;

    // RAF throttle — store latest pointer event, apply on next frame
    let rafId:            number | null        = null;
    let latestMoveEvent:  PointerEvent | null  = null;

    function applyMove() {
      rafId = null;
      const e = latestMoveEvent;
      latestMoveEvent = null;
      if (!e || !dragMode || !dragId) return;

      if (dragMode === "body") {
        if (!dragStartUV || !dragStartXY || !dragZone) return;
        const hits     = getHits(e, gl, camera, scene);
        const sameZone = hits.find((h) => h.zone === dragZone);
        if (!sameZone) return;
        const start = normaliseUV(dragStartUV.x, dragStartUV.y, dragZone);
        const cur   = normaliseUV(sameZone.uv.x, sameZone.uv.y, dragZone);
        const newX  = Math.max(0.01, Math.min(0.99, dragStartXY.x + (cur.nx - start.nx)));
        const newY  = Math.max(0.01, Math.min(0.99, dragStartXY.y + (cur.ny - start.ny)));
        const id    = dragId;
        const { layers } = useConfiguratorStore.getState();
        useConfiguratorStore.setState({ layers: layers.map((l) => l.id === id ? { ...l, x: newX, y: newY } : l) });

      } else if (dragMode === "rotate") {
        const newRotation = dragStartRotation + (e.clientY - dragStartClientY) * 0.5;
        const id = dragId;
        const { layers } = useConfiguratorStore.getState();
        useConfiguratorStore.setState({ layers: layers.map((l) => l.id === id ? { ...l, rotation: newRotation } : l) });

      } else if (dragMode === "resize") {
        const newFontSize = Math.max(20, Math.min(400, dragStartFontSize + (e.clientX - dragStartClientX) * 0.5));
        const id = dragId;
        const { layers } = useConfiguratorStore.getState();
        useConfiguratorStore.setState({ layers: layers.map((l) => l.id === id ? { ...l, fontSize: newFontSize } : l) });
      }
    }

    function onPointerDown(e: PointerEvent) {
      wasDrag = false;

      const hits  = getHits(e, gl, camera, scene);
      const found = findLayerHit(hits);

      if (!found) {
        useConfiguratorStore.getState().selectLayer(null);
        return;
      }

      const state = useConfiguratorStore.getState();
      const gz    = found.result.gizmoZone;
      const id    = found.result.id;

      if (gz === "delete") { useConfiguratorStore.getState().removeLayer(id);    e.stopPropagation(); return; }
      if (gz === "copy")   { useConfiguratorStore.getState().duplicateLayer(id); e.stopPropagation(); return; }

      if (gz === "body" && id !== state.selectedId) {
        useConfiguratorStore.getState().selectLayer(id);
        e.stopPropagation();
        return;
      }

      const layer = state.layers.find((l) => l.id === id);
      if (!layer || layer.locked) return;

      dragId           = id;
      dragZone         = found.zone;
      dragStartClientX = e.clientX;
      dragStartClientY = e.clientY;

      if (gz === "body") {
        dragMode    = "body";
        dragStartUV = found.uv.clone();
        dragStartXY = { x: layer.x, y: layer.y };
        canvas.style.cursor = "grabbing";
      } else if (gz === "rotate") {
        dragMode          = "rotate";
        dragStartRotation = layer.rotation ?? 0;
        canvas.style.cursor = "ns-resize";
      } else if (gz === "resize") {
        dragMode          = "resize";
        dragStartFontSize = layer.fontSize ?? 128;
        canvas.style.cursor = "ew-resize";
      }

      e.stopPropagation();
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragMode || !dragId) return;
      wasDrag = true;
      // Store latest event; schedule one RAF if not already pending
      latestMoveEvent = e;
      if (rafId === null) rafId = requestAnimationFrame(applyMove);
    }

    function onPointerUp() {
      // Flush pending move immediately
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; applyMove(); }

      if (dragMode && wasDrag && dragId) {
        const state = useConfiguratorStore.getState();
        const layer = state.layers.find((l) => l.id === dragId);
        if (layer) {
          if (dragMode === "body")   state.updateLayer(dragId, { x: layer.x, y: layer.y });
          if (dragMode === "rotate") state.updateLayer(dragId, { rotation: layer.rotation });
          if (dragMode === "resize") state.updateLayer(dragId, { fontSize: layer.fontSize });
        }
      }

      dragMode    = null;
      dragId      = null;
      dragZone    = null;
      dragStartUV = null;
      dragStartXY = null;
      canvas.style.cursor = "";
      wasDrag = false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const state = useConfiguratorStore.getState();
        if (state.selectedId) state.selectLayer(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const state = useConfiguratorStore.getState();
        if (state.selectedId) state.removeLayer(state.selectedId);
      }
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove",  onPointerMove);
    window.addEventListener("pointerup",    onPointerUp);
    window.addEventListener("keydown",      onKeyDown);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove",  onPointerMove);
      window.removeEventListener("pointerup",    onPointerUp);
      window.removeEventListener("keydown",      onKeyDown);
    };
  }, [gl, camera, scene]);

  return null;
};

export const DesignLayers = () => {
  useNameBridge();
  useNumberBridge();
  return <PointerHandler />;
};
