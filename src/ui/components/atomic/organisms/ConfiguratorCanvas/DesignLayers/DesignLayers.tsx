'use client';

import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useConfiguratorStore } from '@store';
import {
  clearDesignDragPreview,
  registerDesignRenderInvalidate,
  setDesignDragPreview,
  setDesignInteracting,
  useLogoBridge,
  useNameBridge,
  useNumberBridge,
} from '@hooks';
import { findLayerHit, getHitOnMesh, getHits, isOrbitControlsEnabled, orbitControlsRef } from '@utils';
import type { DesignLayer, PrintZoneKey } from '@types';

type DragMode = 'body' | 'rotate' | 'resize';

const clamp01 = (v: number) => Math.max(0.01, Math.min(0.99, v));
const DRAG_THRESHOLD_PX = 6;

const PointerHandler = () => {
  const { gl, camera, scene, invalidate } = useThree();

  useEffect(() => registerDesignRenderInvalidate(invalidate), [invalidate]);
  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    let dragMode: DragMode | null = null;
    let dragId: string | null = null;
    let dragZone: PrintZoneKey | null = null;
    let pendingDragMode: DragMode | null = null;
    let dragStartUV: THREE.Vector2 | null = null;
    let dragStartXY: { x: number; y: number } | null = null;
    let dragMeshName: string | null = null;
    let dragStartClientX = 0;
    let dragStartClientY = 0;
    let dragStartRotation = 0;
    let dragStartFontSize = 0;
    let dragStartScaleX = 0;
    let dragStartScaleY = 0;
    let wasDrag = false;
    let suppressPointerUp = false;
    let lastPreview: { x?: number; y?: number; rotation?: number; fontSize?: number; scaleX?: number; scaleY?: number } | null = null;

    function cancelOrbitGesture(e: PointerEvent) {
      const controls = orbitControlsRef.current;
      if (controls) {
        controls.enabled = false;
        controls.enabled = isOrbitControlsEnabled();
      }
      suppressPointerUp = true;
      canvas.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType }),
      );
    }

    function beginDrag(mode: DragMode, id: string, zone: PrintZoneKey, layer: DesignLayer, uv: THREE.Vector2) {
      dragMode = mode;
      dragId = id;
      dragZone = zone;
      pendingDragMode = null;
      setDesignInteracting(true);
      if (mode === 'body') {
        dragStartUV = uv.clone();
        dragStartXY = { x: layer.x, y: layer.y };
        // find mesh name for this zone to lock drag to same mesh
        scene.traverse((obj) => {
          if (dragMeshName) return;
          if (obj instanceof THREE.Mesh && obj.name.toLowerCase().includes(zone)) {
            dragMeshName = obj.name;
          }
        });
        canvas.style.cursor = 'grabbing';
      } else if (mode === 'rotate') {
        dragStartRotation = layer.rotation ?? 0;
        canvas.style.cursor = 'ns-resize';
      } else {
        // resize — logos use scaleX/scaleY, text/number use fontSize
        if (layer.type === 'logo') {
          dragStartScaleX = layer.scaleX ?? 0.07;
          dragStartScaleY = layer.scaleY ?? 0.07;
        } else {
          dragStartFontSize = layer.fontSize ?? 128;
        }
        canvas.style.cursor = 'ew-resize';
      }
    }

    function resetDragState() {
      clearDesignDragPreview();
      setDesignInteracting(false); // safe to call even if never set to true
      lastPreview = null;
      dragMode = null;
      dragId = null;
      dragZone = null;
      pendingDragMode = null;
      dragStartUV = null;
      dragStartXY = null;
      dragMeshName = null;
      canvas.style.cursor = '';
      wasDrag = false;
    }

    let rafId: number | null = null;
    let latestMoveEvent: PointerEvent | null = null;

    function applyMove() {
      rafId = null;
      const e = latestMoveEvent;
      latestMoveEvent = null;
      if (!e || !dragMode || !dragId) return;

      if (dragMode === 'body') {
        if (!dragStartUV || !dragStartXY) return;
        // lock to the same mesh to get consistent UV space
        const hit = dragMeshName ? getHitOnMesh(e, gl, camera, scene, dragMeshName) : (getHits(e, gl, camera, scene)[0] ?? null);
        if (!hit) return;
        const x = clamp01(dragStartXY.x + (hit.uv.x - dragStartUV.x));
        const y = clamp01(dragStartXY.y + (hit.uv.y - dragStartUV.y));
        lastPreview = { x, y };
        setDesignDragPreview({ id: dragId, x, y });
        return;
      }

      if (dragMode === 'rotate') {
        const rotation = dragStartRotation + (e.clientY - dragStartClientY) * 0.5;
        lastPreview = { rotation };
        setDesignDragPreview({ id: dragId, rotation });
        return;
      }

      if (dragMode === 'resize') {
        const layer = useConfiguratorStore.getState().layers.find((l) => l.id === dragId);
        if (!layer) return;
        if (layer.type === 'logo') {
          const delta = (e.clientX - dragStartClientX) * 0.0003;
          const scaleX = Math.max(0.01, dragStartScaleX + delta);
          const scaleY = Math.max(0.01, dragStartScaleY + delta);
          lastPreview = { scaleX, scaleY };
          setDesignDragPreview({ id: dragId, scaleX, scaleY });
        } else {
          const fontSize = Math.max(20, Math.min(400, dragStartFontSize + (e.clientX - dragStartClientX) * 0.5));
          lastPreview = { fontSize };
          setDesignDragPreview({ id: dragId, fontSize });
        }
      }
    }

    function onPointerDown(e: PointerEvent) {
      wasDrag = false;
      pendingDragMode = null;
      const state = useConfiguratorStore.getState();
      const hits = getHits(e, gl, camera, scene);
      const found = findLayerHit(hits, state);
      if (!found) {
        state.selectLayer(null);
        return;
      }
      const gz = found.result.gizmoZone;
      const id = found.result.id;
      if (gz === 'delete') {
        state.removeLayer(id);
        e.stopPropagation();
        return;
      }
      if (gz === 'copy') {
        state.duplicateLayer(id);
        e.stopPropagation();
        return;
      }
      if (gz === 'body' && id !== state.selectedId) {
        state.selectLayer(id);
        e.stopPropagation();
        return;
      }
      const layer = state.layers.find((l) => l.id === id);
      if (!layer || layer.locked || layer.interactive === false) return;
      dragId = id;
      dragZone = found.zone;
      dragStartClientX = e.clientX;
      dragStartClientY = e.clientY;
      if (gz === 'body' && id === state.selectedId) {
        pendingDragMode = 'body';
        e.stopPropagation();
        return;
      }
      if (gz === 'rotate' || gz === 'resize') {
        beginDrag(gz, id, found.zone, layer, found.uv);
        e.stopPropagation();
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (pendingDragMode && !dragMode && dragId && dragZone) {
        const dist = Math.hypot(e.clientX - dragStartClientX, e.clientY - dragStartClientY);
        if (dist >= DRAG_THRESHOLD_PX) {
          const state = useConfiguratorStore.getState();
          const layer = state.layers.find((l) => l.id === dragId);
          const hits = getHits(e, gl, camera, scene);
          const found = findLayerHit(hits, state);
          if (layer && found && found.result.id === dragId) {
            cancelOrbitGesture(e);
            beginDrag(pendingDragMode, dragId, dragZone, layer, found.uv);
            e.stopPropagation();
          } else {
            pendingDragMode = null;
            dragId = null;
            dragZone = null;
          }
        }
      }
      if (!dragMode || !dragId) return;
      wasDrag = true;
      latestMoveEvent = e;
      if (rafId === null) rafId = requestAnimationFrame(applyMove);
    }

    function onPointerUp() {
      if (suppressPointerUp) {
        suppressPointerUp = false;
        return;
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
        applyMove();
      }
      if (dragMode && wasDrag && dragId && lastPreview) {
        const state = useConfiguratorStore.getState();
        if (dragMode === 'body' && lastPreview.x !== undefined && lastPreview.y !== undefined)
          state.updateLayer(dragId, { x: lastPreview.x, y: lastPreview.y });
        if (dragMode === 'rotate' && lastPreview.rotation !== undefined) state.updateLayer(dragId, { rotation: lastPreview.rotation });
        if (dragMode === 'resize') {
          if (lastPreview.scaleX !== undefined && lastPreview.scaleY !== undefined)
            state.updateLayer(dragId, { scaleX: lastPreview.scaleX, scaleY: lastPreview.scaleY });
          else if (lastPreview.fontSize !== undefined) state.updateLayer(dragId, { fontSize: lastPreview.fontSize });
        }
      }
      if (!wasDrag && pendingDragMode) {
        pendingDragMode = null;
        dragId = null;
        dragZone = null;
        dragStartUV = null;
        dragStartXY = null;
        return;
      }
      resetDragState();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const state = useConfiguratorStore.getState();
        if (state.selectedId) state.selectLayer(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useConfiguratorStore.getState();
        if (state.selectedId) state.removeLayer(state.selectedId);
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resetDragState();
      canvas.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [gl, camera, scene]);

  return null;
};

const DesignLayers = () => {
  useLogoBridge();
  useNameBridge();
  useNumberBridge();
  return <PointerHandler />;
};

export { DesignLayers };
