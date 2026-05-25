"use client";

import { useCallback } from "react";
import * as THREE from "three";
import { Decal, Html } from "@react-three/drei";
import { useNameStore } from "@store";
import { useNameTexture } from "@hooks";

interface NameLayerProps {
  meshRef: React.RefObject<THREE.Mesh | null>;
}

const ROTATE_STEP = Math.PI / 12; // 15°
const SCALE_STEP = 0.01;
const SCALE_MIN = 0.03;
const SCALE_MAX = 0.8;

export const NameLayer = ({ meshRef }: NameLayerProps) => {
  const {
    isVisible,
    isSelected,
    text,
    font,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    decalPosition,
    decalRotation,
    decalScale,
    setSelected,
    setVisible,
    setDecalRotation,
    setDecalScale,
  } = useNameStore();

  const texture = useNameTexture({
    text,
    font,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
  });

  console.log('[NameLayer] render', {
    isVisible,
    meshRef: meshRef.current,
    texture,
    textureImage: texture?.image,
    decalPosition,
    decalRotation,
    decalScale,
  });

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      console.log(1);
      setSelected(true);
    },
    [setSelected],
  );

  const handleRotateCW = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDecalRotation([decalRotation[0], decalRotation[1], decalRotation[2] + ROTATE_STEP]);
    },
    [decalRotation, setDecalRotation],
  );

  const handleScaleUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const next = Math.min(decalScale[0] + SCALE_STEP, SCALE_MAX);
      setDecalScale([next, next * 0.23, next]);
    },
    [decalScale, setDecalScale],
  );

  const handleScaleDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const next = Math.max(decalScale[0] - SCALE_STEP, SCALE_MIN);
      setDecalScale([next, next * 0.23, next]);
    },
    [decalScale, setDecalScale],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setVisible(false);
    },
    [setVisible],
  );

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text).catch(() => {});
    },
    [text],
  );

  if (!isVisible) return null;

  return (
    <Decal
      mesh={meshRef as React.RefObject<THREE.Mesh>}
      position={decalPosition}
      rotation={decalRotation}
      scale={decalScale}
      map={texture}
      onClick={handleClick}
      onPointerDown={handleClick}
      renderOrder={3}
      depthTest={true}
      debug
    >
      {isSelected && (
        <Html center style={{ pointerEvents: "none", userSelect: "none" }} zIndexRange={[100, 0]}>
          <div style={gizmoBoxStyle}>
            <button onPointerDown={stop} onClick={handleCopy} style={handleStyle("top", "left")} title="Copia testo">
              <CopyIcon />
            </button>
            <button onPointerDown={stop} onClick={handleDelete} style={handleStyle("bottom", "left")} title="Elimina">
              <TrashIcon />
            </button>
            <button onPointerDown={stop} onClick={handleRotateCW} style={handleStyle("top", "right")} title="Ruota">
              <RotateIcon />
            </button>
            <div style={scaleGroupStyle}>
              <button onPointerDown={stop} onClick={handleScaleUp} style={scaleButtonStyle("top")} title="Ingrandisci">+</button>
              <button onPointerDown={stop} onClick={handleScaleDown} style={scaleButtonStyle("bottom")} title="Rimpicciolisci">−</button>
            </div>
          </div>
        </Html>
      )}
    </Decal>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const stop = (e: React.PointerEvent) => e.stopPropagation();

// ── Styles ────────────────────────────────────────────────────────────────────

const gizmoBoxStyle: React.CSSProperties = {
  position: "relative",
  width: 220,
  height: 60,
  border: "2px dashed rgba(59,130,246,0.8)",
  borderRadius: 4,
  pointerEvents: "none",
};

const handleStyle = (v: "top" | "bottom", h: "left" | "right"): React.CSSProperties => ({
  position: "absolute",
  [v]: -18,
  [h]: -18,
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "white",
  border: "1.5px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  pointerEvents: "all",
});

const scaleGroupStyle: React.CSSProperties = {
  position: "absolute",
  bottom: -18,
  right: -18,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  pointerEvents: "all",
};

const scaleButtonStyle = (pos: "top" | "bottom"): React.CSSProperties => ({
  width: 36,
  height: 17,
  borderRadius: pos === "top" ? "8px 8px 2px 2px" : "2px 2px 8px 8px",
  background: "white",
  border: "1.5px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 12,
  lineHeight: 1,
  color: "#374151",
  pointerEvents: "all",
});

// ── Icons ─────────────────────────────────────────────────────────────────────

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);
