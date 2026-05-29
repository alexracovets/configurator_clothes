"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Decal } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import { DECAL_SCALE_MIN, DECAL_SCALE_MAX } from "@constants";
import { useNumberStore, clampDecalScale } from "@store";
import { useDecalTexture, buildDecalLayout, hitTestDecal, gizmoCursor } from "@hooks";
import { setOrbitLockedByNameTool } from "@utils";
import type { NumberInstance } from "@types";
import type { GizmoHandle, GizmoZone } from "@types";

type DragMode = "move" | GizmoHandle | null;

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  grabOffset: [number, number, number];
  startRotZ: number;
  startScale: number;
}

const ROTATE_SENS = 0.015;
const SCALE_SENS = 0.008;
const _worldHit = new THREE.Vector3();
const _localHit = new THREE.Vector3();

const NumberDecalInstance = ({ instance, hoverZone, onMeshRef }: { instance: NumberInstance; hoverZone: GizmoZone; onMeshRef: (mesh: THREE.Mesh | null) => void }) => {
  const texture = useDecalTexture({ text: instance.text, font: instance.font, fontSize: instance.fontSize, textColor: instance.textColor, strokeColor: instance.strokeColor, strokeWidth: instance.strokeWidth, showGizmo: true, hoveredZone: hoverZone });

  return (
    <Decal ref={onMeshRef} position={instance.decalPosition} rotation={instance.decalRotation} scale={instance.decalScale} renderOrder={20}>
      <meshBasicMaterial map={texture} transparent depthTest={true} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </Decal>
  );
};

const NumberLayer = () => {
  const isVisible = useNumberStore(({ isVisible }) => isVisible);
  const instance = useNumberStore(({ instance }) => instance);
  const update = useNumberStore(({ update }) => update);
  const setVisible = useNumberStore(({ setVisible }) => setVisible);

  const [hoverZone, setHoverZone] = useState<GizmoZone>(null);

  const { gl, camera, raycaster } = useThree();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const instanceRef = useRef(instance);
  const dragRef = useRef<DragState>({ mode: null, startX: 0, startY: 0, grabOffset: [0, 0, 0], startRotZ: 0, startScale: 0 });
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => { canvasElRef.current = gl.domElement; }, [gl]);
  useEffect(() => { instanceRef.current = instance; }, [instance]);

  const registerMesh = (mesh: THREE.Mesh | null) => { meshRef.current = mesh; };

  useEffect(() => {
    if (!isVisible) {
      setOrbitLockedByNameTool(false);
      const el = canvasElRef.current;
      if (el) el.style.cursor = "auto";
      return;
    }

    const el = canvasElRef.current;
    if (!el) return;

    const setCursor = (zone: GizmoZone) => { el.style.cursor = gizmoCursor(zone); };

    const setPointerFromClient = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      pointer.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const getHitLocal = (clientX: number, clientY: number) => {
      const decalMesh = meshRef.current;
      const mesh = decalMesh?.parent as THREE.Mesh | null;
      if (!mesh) return null;
      mesh.updateMatrixWorld(true);
      setPointerFromClient(clientX, clientY);
      raycaster.setFromCamera(pointer.current, camera);
      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return null;
      _worldHit.copy(hits[0].point);
      _localHit.copy(_worldHit);
      mesh.worldToLocal(_localHit);
      return _localHit.clone();
    };

    const pickZone = (clientX: number, clientY: number): GizmoZone => {
      const mesh = meshRef.current;
      if (!mesh || !instanceRef.current) return null;
      setPointerFromClient(clientX, clientY);
      raycaster.setFromCamera(pointer.current, camera);
      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length || !hits[0].uv) return null;
      const inst = instanceRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const layout = buildDecalLayout(ctx, inst.text, inst.font, inst.fontSize);
      return hitTestDecal(hits[0].uv, layout);
    };

    const applyDrag = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.mode) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (drag.mode === "move") {
        const hitLocal = getHitLocal(e.clientX, e.clientY);
        if (!hitLocal) return;
        const inst = instanceRef.current;
        update({ decalPosition: [hitLocal.x + drag.grabOffset[0], hitLocal.y + drag.grabOffset[1], inst?.decalPosition[2] ?? hitLocal.z] });
        return;
      }
      if (drag.mode === "rotate") {
        const inst = instanceRef.current;
        const r = inst?.decalRotation ?? [Math.PI, 0, 0];
        update({ decalRotation: [r[0], r[1], drag.startRotZ - dy * ROTATE_SENS] });
        return;
      }
      if (drag.mode === "resize") {
        const width = Math.min(DECAL_SCALE_MAX, Math.max(DECAL_SCALE_MIN, drag.startScale + (dx - dy) * SCALE_SENS));
        update({ decalScale: clampDecalScale(width) });
      }
    };

    const endDrag = (e: PointerEvent) => {
      dragRef.current.mode = null;
      const zone = pickZone(e.clientX, e.clientY);
      setHoverZone(zone);
      setOrbitLockedByNameTool(!!zone);
      setCursor(zone);
    };

    const startDrag = (zone: GizmoZone, inst: NumberInstance, e: PointerEvent) => {
      if (zone !== "body" && zone !== "rotate" && zone !== "resize") return;
      setOrbitLockedByNameTool(true);
      e.preventDefault();
      e.stopImmediatePropagation();
      let grabOffset: [number, number, number] = [0, 0, 0];
      if (zone === "body") {
        const hitLocal = getHitLocal(e.clientX, e.clientY);
        if (!hitLocal) return;
        grabOffset = [inst.decalPosition[0] - hitLocal.x, inst.decalPosition[1] - hitLocal.y, 0];
      }
      dragRef.current = { mode: zone === "body" ? "move" : zone, startX: e.clientX, startY: e.clientY, grabOffset, startRotZ: inst.decalRotation[2], startScale: inst.decalScale[0] };
      setCursor(zone);
      const onMove = (ev: PointerEvent) => { ev.preventDefault(); ev.stopImmediatePropagation(); applyDrag(ev); };
      const onUp = (ev: PointerEvent) => { ev.preventDefault(); ev.stopImmediatePropagation(); window.removeEventListener("pointermove", onMove, true); window.removeEventListener("pointerup", onUp, true); endDrag(ev); };
      window.addEventListener("pointermove", onMove, { capture: true });
      window.addEventListener("pointerup", onUp, { capture: true });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragRef.current.mode) return;
      const zone = pickZone(e.clientX, e.clientY);
      setHoverZone(zone);
      setOrbitLockedByNameTool(!!zone);
      setCursor(zone);
    };

    const onPointerDown = (e: PointerEvent) => {
      const zone = pickZone(e.clientX, e.clientY);
      if (!zone) return;
      const inst = instanceRef.current;
      if (!inst) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      setOrbitLockedByNameTool(true);
      setCursor(zone);
      if (zone === "copy") return;
      if (zone === "delete") { setVisible(false); setOrbitLockedByNameTool(false); setCursor(null); return; }
      startDrag(zone, inst, e);
    };

    const onPointerLeave = () => {
      if (dragRef.current.mode) return;
      setHoverZone(null);
      setOrbitLockedByNameTool(false);
      setCursor(null);
    };

    el.addEventListener("pointerdown", onPointerDown, { capture: true });
    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown, { capture: true });
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      setOrbitLockedByNameTool(false);
      el.style.cursor = "auto";
    };
  }, [camera, isVisible, raycaster, setVisible, update]);

  useEffect(() => () => setOrbitLockedByNameTool(false), []);

  if (!isVisible || !instance) return null;

  return <NumberDecalInstance instance={instance} hoverZone={hoverZone} onMeshRef={registerMesh} />;
};

export { NumberLayer };
