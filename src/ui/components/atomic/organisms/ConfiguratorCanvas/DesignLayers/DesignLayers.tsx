"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useNameBridge, useNumberBridge, clearDesignDragPreview, registerDesignRenderInvalidate, setDesignDragPreview, setDesignInteracting } from "@hooks";
import { useConfiguratorStore } from "@store";
import { findLayerHit, getHitInZone, getHits, normaliseUV, isOrbitControlsEnabled, orbitControlsRef } from "@utils";
import type { DesignLayer } from "@store";
import type { PrintZoneKey } from "@utils";

type DragMode = "body" | "rotate" | "resize";

const clamp01 = (v: number) => Math.max(0.01, Math.min(0.99, v));
const DRAG_THRESHOLD_PX = 6;

const PointerHandler = () => {
  const { gl, camera, scene, invalidate } = useThree();

  useEffect(() => registerDesignRenderInvalidate(invalidate), [invalidate]);
  useEffect(() => { invalidate(); }, [invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    let dragMode: DragMode | null = null;
    let dragId: string | null = null;
    let dragZone: PrintZoneKey | null = null;
    let pendingDragMode: DragMode | null = null;
    let dragStartUV: THREE.Vector2 | null = null;
    let dragStartXY: { x: number; y: number } | null = null;
    let dragStartClientX = 0;
    let dragStartClientY = 0;
    let dragStartRotation = 0;
    let dragStartFontSize = 0;
    let wasDrag = false;
    let suppressPointerUp = false;

    function cancelOrbitGesture(e: PointerEvent) {
      const controls = orbitControlsRef.current;
      if (controls) { controls.enabled = false; controls.enabled = isOrbitControlsEnabled(); }
      suppressPointerUp = true;
      canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType }));
    }

    function beginDrag(mode: DragMode, id: string, zone: PrintZoneKey, layer: DesignLayer, uv: THREE.Vector2) {
      dragMode = mode; dragId = id; dragZone = zone; pendingDragMode = null;
      setDesignInteracting(true);
      if (mode === "body") { dragStartUV = uv.clone(); dragStartXY = { x: layer.x, y: layer.y }; canvas.style.cursor = "grabbing"; }
      else if (mode === "rotate") { dragStartRotation = layer.rotation ?? 0; canvas.style.cursor = "ns-resize"; }
      else { dragStartFontSize = layer.fontSize ?? 128; canvas.style.cursor = "ew-resize"; }
    }

    function resetDragState() {
      clearDesignDragPreview(); setDesignInteracting(false); lastPreview = null;
      dragMode = null; dragId = null; dragZone = null; pendingDragMode = null;
      dragStartUV = null; dragStartXY = null; canvas.style.cursor = ""; wasDrag = false;
    }

    let rafId: number | null = null;
    let latestMoveEvent: PointerEvent | null = null;
    let lastPreview: { x?: number; y?: number; rotation?: number; fontSize?: number } | null = null;

    function applyMove() {
      rafId = null;
      const e = latestMoveEvent; latestMoveEvent = null;
      if (!e || !dragMode || !dragId) return;
      if (dragMode === "body") {
        if (!dragStartUV || !dragStartXY || !dragZone) return;
        const hit = getHitInZone(e, gl, camera, scene, dragZone);
        if (!hit) return;
        const start = normaliseUV(dragStartUV.x, dragStartUV.y, dragZone);
        const cur = normaliseUV(hit.uv.x, hit.uv.y, dragZone);
        lastPreview = { x: clamp01(dragStartXY.x + (cur.nx - start.nx)), y: clamp01(dragStartXY.y + (cur.ny - start.ny)) };
        setDesignDragPreview({ id: dragId, ...lastPreview });
        return;
      }
      if (dragMode === "rotate") {
        lastPreview = { rotation: dragStartRotation + (e.clientY - dragStartClientY) * 0.5 };
        setDesignDragPreview({ id: dragId, ...lastPreview });
        return;
      }
      if (dragMode === "resize") {
        lastPreview = { fontSize: Math.max(20, Math.min(400, dragStartFontSize + (e.clientX - dragStartClientX) * 0.5)) };
        setDesignDragPreview({ id: dragId, ...lastPreview });
      }
    }

    function onPointerDown(e: PointerEvent) {
      wasDrag = false; pendingDragMode = null;
      const hits = getHits(e, gl, camera, scene);
      const found = findLayerHit(hits);
      if (!found) { useConfiguratorStore.getState().selectLayer(null); return; }
      const state = useConfiguratorStore.getState();
      const gz = found.result.gizmoZone;
      const id = found.result.id;
      if (gz === "delete") { useConfiguratorStore.getState().removeLayer(id); e.stopPropagation(); return; }
      if (gz === "copy") { useConfiguratorStore.getState().duplicateLayer(id); e.stopPropagation(); return; }
      if (gz === "body" && id !== state.selectedId) { useConfiguratorStore.getState().selectLayer(id); e.stopPropagation(); return; }
      const layer = state.layers.find((l) => l.id === id);
      if (!layer || layer.locked) return;
      dragId = id; dragZone = found.zone; dragStartClientX = e.clientX; dragStartClientY = e.clientY;
      if (gz === "body" && id === state.selectedId) { pendingDragMode = "body"; e.stopPropagation(); return; }
      if (gz === "rotate" || gz === "resize") { beginDrag(gz, id, found.zone, layer, found.uv); e.stopPropagation(); }
    }

    function onPointerMove(e: PointerEvent) {
      if (pendingDragMode && !dragMode && dragId && dragZone) {
        const dist = Math.hypot(e.clientX - dragStartClientX, e.clientY - dragStartClientY);
        if (dist >= DRAG_THRESHOLD_PX) {
          const state = useConfiguratorStore.getState();
          const layer = state.layers.find((l) => l.id === dragId);
          const hits = getHits(e, gl, camera, scene);
          const found = findLayerHit(hits);
          if (layer && found && found.result.id === dragId) { cancelOrbitGesture(e); beginDrag(pendingDragMode, dragId, dragZone, layer, found.uv); e.stopPropagation(); }
          else { pendingDragMode = null; dragId = null; dragZone = null; }
        }
      }
      if (!dragMode || !dragId) return;
      wasDrag = true; latestMoveEvent = e;
      if (rafId === null) rafId = requestAnimationFrame(applyMove);
    }

    function onPointerUp() {
      if (suppressPointerUp) { suppressPointerUp = false; return; }
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; applyMove(); }
      if (dragMode && wasDrag && dragId && lastPreview) {
        const state = useConfiguratorStore.getState();
        if (dragMode === "body" && lastPreview.x !== undefined && lastPreview.y !== undefined) state.updateLayer(dragId, { x: lastPreview.x, y: lastPreview.y });
        if (dragMode === "rotate" && lastPreview.rotation !== undefined) state.updateLayer(dragId, { rotation: lastPreview.rotation });
        if (dragMode === "resize" && lastPreview.fontSize !== undefined) state.updateLayer(dragId, { fontSize: lastPreview.fontSize });
      }
      if (!wasDrag && pendingDragMode) { pendingDragMode = null; dragId = null; dragZone = null; dragStartUV = null; dragStartXY = null; return; }
      resetDragState();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { const state = useConfiguratorStore.getState(); if (state.selectedId) state.selectLayer(null); }
      else if (e.key === "Delete" || e.key === "Backspace") { const state = useConfiguratorStore.getState(); if (state.selectedId) state.removeLayer(state.selectedId); }
    }

    canvas.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resetDragState();
      canvas.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gl, camera, scene]);

  return null;
};

export const DesignLayers = () => {
  useNameBridge();
  useNumberBridge();
  return <PointerHandler />;
};
