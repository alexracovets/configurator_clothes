"use client";

import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import { useConfiguratorStore } from "@store";
import type { DesignLayer } from "@store";

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 4v8M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ToolBtn = ({
  onClick,
  title,
  danger = false,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      width:           32,
      height:          32,
      borderRadius:    8,
      border:          "none",
      cursor:          "pointer",
      background:      "transparent",
      color:           danger ? "#ef4444" : "#1f2937",
      transition:      "background 0.15s",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = danger
        ? "rgba(239,68,68,0.1)"
        : "rgba(0,0,0,0.06)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
    }}
  >
    {children}
  </button>
);

const Sep = () => (
  <div style={{ width: 1, height: 20, background: "#e5e7eb", margin: "0 2px" }} />
);

function layerLabel(layer: DesignLayer): string {
  if (layer.type === "text" || layer.type === "number") {
    return `"${(layer.text ?? "").slice(0, 14)}"`;
  }
  return "Logo";
}

const ToolbarInner = ({ layer }: { layer: DesignLayer }) => {
  const selectLayer    = useConfiguratorStore((s) => s.selectLayer);
  const removeLayer    = useConfiguratorStore((s) => s.removeLayer);
  const duplicateLayer = useConfiguratorStore((s) => s.duplicateLayer);
  const bringForward   = useConfiguratorStore((s) => s.bringForward);
  const sendBackward   = useConfiguratorStore((s) => s.sendBackward);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleDelete = useCallback((e: React.MouseEvent) => {
    stop(e);
    removeLayer(layer.id);
  }, [layer.id, removeLayer]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    stop(e);
    duplicateLayer(layer.id);
  }, [layer.id, duplicateLayer]);

  const handleUp = useCallback((e: React.MouseEvent) => {
    stop(e);
    bringForward(layer.id);
  }, [layer.id, bringForward]);

  const handleDown = useCallback((e: React.MouseEvent) => {
    stop(e);
    sendBackward(layer.id);
  }, [layer.id, sendBackward]);

  const handleDeselect = useCallback((e: React.MouseEvent) => {
    stop(e);
    selectLayer(null);
  }, [selectLayer]);

  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           2,
        background:    "#ffffff",
        borderRadius:  12,
        padding:       "4px 6px",
        boxShadow:     "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)",
        border:        "1px solid rgba(0,0,0,0.06)",
        whiteSpace:    "nowrap",
        userSelect:    "none",
        pointerEvents: "all",
      }}
      onMouseDown={stop}
      onClick={stop}
    >
      {/* Layer name chip */}
      <span style={{
        fontSize:     12,
        fontWeight:   600,
        color:        "#6b7280",
        padding:      "0 6px",
        fontFamily:   "Inter, system-ui, sans-serif",
      }}>
        {layerLabel(layer)}
      </span>

      <Sep />

      <ToolBtn onClick={handleDuplicate} title="Копіювати">
        <IconCopy />
      </ToolBtn>

      <ToolBtn onClick={handleUp} title="Вище">
        <IconUp />
      </ToolBtn>

      <ToolBtn onClick={handleDown} title="Нижче">
        <IconDown />
      </ToolBtn>

      <Sep />

      <ToolBtn onClick={handleDelete} title="Видалити" danger>
        <IconDelete />
      </ToolBtn>

      <Sep />

      <ToolBtn onClick={handleDeselect} title="Закрити">
        <IconClose />
      </ToolBtn>
    </div>
  );
};

function uvToWorldBack(x: number, y: number): THREE.Vector3 {
  return new THREE.Vector3(
    (x - 0.5) * 0.7,
    1.5 - y * 0.8,
    -0.07,
  );
}

function uvToWorldFront(x: number, y: number): THREE.Vector3 {
  return new THREE.Vector3(
    (x - 0.5) * 0.7,
    1.5 - y * 0.8,
    0.07,
  );
}

export const DesignToolbar = () => {
  const selectedId = useConfiguratorStore((s) => s.selectedId);
  const layer      = useConfiguratorStore((s) =>
    s.selectedId ? s.layers.find((l) => l.id === s.selectedId) ?? null : null,
  );

  if (!layer || !selectedId) return null;

  const pos = layer.zone === "front"
    ? uvToWorldFront(layer.x, layer.y)
    : uvToWorldBack(layer.x, layer.y);

  const toolbarPos = pos.clone().add(new THREE.Vector3(0, 0.12, 0));

  return (
    <Html
      position={[toolbarPos.x, toolbarPos.y, toolbarPos.z]}
      center
      zIndexRange={[100, 200]}
      style={{ pointerEvents: "none" }}
      occlude={false}
    >
      <ToolbarInner layer={layer} />
    </Html>
  );
};