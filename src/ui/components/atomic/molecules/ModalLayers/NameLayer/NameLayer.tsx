"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Decal } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import { useNameStore, DECAL_SCALE_MIN, DECAL_SCALE_MAX, clampDecalScale } from "@store";
import { useDecalTexture, buildDecalLayout, hitTestDecal, gizmoCursor } from "@hooks";
import { setOrbitLockedByNameTool } from "@utils";
import type { NameInstance } from "@store";
import type { GizmoHandle, GizmoZone } from "@types";

type DragMode = "move" | GizmoHandle | null;

interface DragState {
  instanceId: string | null;
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

const NameDecalInstance = ({ instance, hoverZone, onMeshRef }: { instance: NameInstance; hoverZone: GizmoZone; onMeshRef: (id: string, mesh: THREE.Mesh | null) => void }) => {
  const texture = useDecalTexture({ text: instance.text, font: instance.font, fontSize: instance.fontSize, textColor: instance.textColor, strokeColor: instance.strokeColor, strokeWidth: instance.strokeWidth, showGizmo: true, hoveredZone: hoverZone });

  return (
    <Decal ref={(mesh) => onMeshRef(instance.id, mesh)} position={instance.decalPosition} rotation={instance.decalRotation} scale={instance.decalScale} renderOrder={20}>
      <meshBasicMaterial map={texture} transparent depthTest={true} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </Decal>
  );
};

const NameLayer = () => {
  const isVisible = useNameStore(({ isVisible }) => isVisible);
  const instances = useNameStore(({ instances }) => instances);
  const setActiveId = useNameStore(({ setActiveId }) => setActiveId);
  const updateInstance = useNameStore(({ updateInstance }) => updateInstance);
  const duplicateInstance = useNameStore(({ duplicateInstance }) => duplicateInstance);
  const removeInstance = useNameStore(({ removeInstance }) => removeInstance);

  const [hoverZone, setHoverZone] = useState<GizmoZone>(null);
  const [hoverInstanceId, setHoverInstanceId] = useState<string | null>(null);

  const { gl, camera, raycaster } = useThree();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const instancesRef = useRef(instances);
  const dragRef = useRef<DragState>({ instanceId: null, mode: null, startX: 0, startY: 0, grabOffset: [0, 0, 0], startRotZ: 0, startScale: 0 });
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => { canvasElRef.current = gl.domElement; }, [gl]);
  useEffect(() => { instancesRef.current = instances; }, [instances]);

  const registerMesh = (id: string, mesh: THREE.Mesh | null) => {
    if (mesh) meshRefs.current.set(id, mesh);
    else meshRefs.current.delete(id);
  };

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
      const decalMesh = meshRefs.current.values().next().value;
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

    const pickInstance = (clientX: number, clientY: number) => {
      setPointerFromClient(clientX, clientY);
      raycaster.setFromCamera(pointer.current, camera);
      let best: { id: string; distance: number; uv: THREE.Vector2 } | null = null;
      for (const { id } of instancesRef.current) {
        const mesh = meshRefs.current.get(id);
        if (!mesh) continue;
        const hits = raycaster.intersectObject(mesh, false);
        if (!hits.length || !hits[0].uv) continue;
        if (!best || hits[0].distance < best.distance) best = { id, distance: hits[0].distance, uv: hits[0].uv };
      }
      if (!best) return null;
      const inst = instancesRef.current.find(({ id }) => id === best!.id);
      if (!inst) return null;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const layout = buildDecalLayout(ctx, inst.text, inst.font, inst.fontSize);
      const zone = hitTestDecal(best.uv, layout);
      return { id: best.id, zone };
    };

    const applyDrag = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.mode || !drag.instanceId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const id = drag.instanceId;
      if (drag.mode === "move") {
        const hitLocal = getHitLocal(e.clientX, e.clientY);
        if (!hitLocal) return;
        const inst = instancesRef.current.find(({ id: instId }) => instId === id);
        updateInstance(id, { decalPosition: [hitLocal.x + drag.grabOffset[0], hitLocal.y + drag.grabOffset[1], inst?.decalPosition[2] ?? hitLocal.z] });
        return;
      }
      if (drag.mode === "rotate") {
        const inst = instancesRef.current.find(({ id: instId }) => instId === id);
        const r = inst?.decalRotation ?? [Math.PI, 0, 0];
        updateInstance(id, { decalRotation: [r[0], r[1], drag.startRotZ - dy * ROTATE_SENS] });
        return;
      }
      if (drag.mode === "resize") {
        const width = Math.min(DECAL_SCALE_MAX, Math.max(DECAL_SCALE_MIN, drag.startScale + (dx - dy) * SCALE_SENS));
        updateInstance(id, { decalScale: clampDecalScale(width) });
      }
    };

    const endDrag = (e: PointerEvent) => {
      dragRef.current.mode = null;
      dragRef.current.instanceId = null;
      const pick = pickInstance(e.clientX, e.clientY);
      setHoverInstanceId(pick?.id ?? null);
      setHoverZone(pick?.zone ?? null);
      setOrbitLockedByNameTool(!!pick?.zone);
      setCursor(pick?.zone ?? null);
    };

    const startDrag = (pick: { id: string; zone: GizmoZone }, inst: NameInstance, e: PointerEvent) => {
      if (pick.zone !== "body" && pick.zone !== "rotate" && pick.zone !== "resize") return;
      setOrbitLockedByNameTool(true);
      e.preventDefault();
      e.stopImmediatePropagation();
      let grabOffset: [number, number, number] = [0, 0, 0];
      if (pick.zone === "body") {
        const hitLocal = getHitLocal(e.clientX, e.clientY);
        if (!hitLocal) return;
        grabOffset = [inst.decalPosition[0] - hitLocal.x, inst.decalPosition[1] - hitLocal.y, 0];
      }
      dragRef.current = { instanceId: pick.id, mode: pick.zone === "body" ? "move" : pick.zone, startX: e.clientX, startY: e.clientY, grabOffset, startRotZ: inst.decalRotation[2], startScale: inst.decalScale[0] };
      setCursor(pick.zone);
      const onMove = (ev: PointerEvent) => { ev.preventDefault(); ev.stopImmediatePropagation(); applyDrag(ev); };
      const onUp = (ev: PointerEvent) => { ev.preventDefault(); ev.stopImmediatePropagation(); window.removeEventListener("pointermove", onMove, true); window.removeEventListener("pointerup", onUp, true); endDrag(ev); };
      window.addEventListener("pointermove", onMove, { capture: true });
      window.addEventListener("pointerup", onUp, { capture: true });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragRef.current.mode) return;
      const pick = pickInstance(e.clientX, e.clientY);
      setHoverInstanceId(pick?.id ?? null);
      setHoverZone(pick?.zone ?? null);
      setOrbitLockedByNameTool(!!pick?.zone);
      setCursor(pick?.zone ?? null);
    };

    const onPointerDown = (e: PointerEvent) => {
      const pick = pickInstance(e.clientX, e.clientY);
      if (!pick?.zone) return;
      const inst = instancesRef.current.find(({ id }) => id === pick.id);
      if (!inst) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      setOrbitLockedByNameTool(true);
      setActiveId(pick.id);
      setCursor(pick.zone);
      if (pick.zone === "copy") { duplicateInstance(pick.id); return; }
      if (pick.zone === "delete") { removeInstance(pick.id); setOrbitLockedByNameTool(false); setCursor(null); return; }
      startDrag(pick, inst, e);
    };

    const onPointerLeave = () => {
      if (dragRef.current.mode) return;
      setHoverZone(null);
      setHoverInstanceId(null);
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
  }, [camera, duplicateInstance, isVisible, raycaster, removeInstance, setActiveId, updateInstance]);

  useEffect(() => { return () => setOrbitLockedByNameTool(false); }, []);

  if (!isVisible || instances.length === 0) return null;

  return (
    <>
      {instances.map((inst) => (
        <NameDecalInstance key={inst.id} instance={inst} hoverZone={inst.id === hoverInstanceId ? hoverZone : null} onMeshRef={registerMesh} />
      ))}
    </>
  );
};

export { NameLayer };
