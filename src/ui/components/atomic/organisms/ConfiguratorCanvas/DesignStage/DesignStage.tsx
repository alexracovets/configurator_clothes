"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Text, Image as KonvaImage, Transformer } from "react-konva";
import type Konva from "konva";

import { useConfiguratorStore, resolveCanvasFont } from "@store";
import { PRINT_ZONES, TEXTURE_SIZE_EDITOR } from "@utils";
import type { DesignLayer } from "@store";
import type { PrintZoneKey } from "@utils";

interface DesignStageProps {
  zone: PrintZoneKey;
  displaySize?: number;
}

const EditableTextNode = ({ layer, isSelected, stageSize, onSelect, onChange }: { layer: DesignLayer; isSelected: boolean; stageSize: number; onSelect: () => void; onChange: (patch: Partial<DesignLayer>) => void }) => {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const font = resolveCanvasFont(layer.font ?? "--font-oswald");
  const fontSize = Math.round((layer.fontSize ?? 128) * (stageSize / TEXTURE_SIZE_EDITOR));
  const px = layer.x * stageSize;
  const py = layer.y * stageSize;

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: e.target.x() / stageSize, y: e.target.y() / stageSize });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    onChange({ x: node.x() / stageSize, y: node.y() / stageSize, scaleX: (node.scaleX() * node.width()) / stageSize, scaleY: (node.scaleY() * node.height()) / stageSize, rotation: node.rotation() });
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <>
      <Text ref={shapeRef} x={px} y={py} text={layer.text ?? (layer.type === "number" ? "9" : "NAME")} fontFamily={font} fontStyle="bold" fontSize={fontSize} fill={layer.textColor ?? "#FFFFFF"} stroke={layer.strokeColor ?? "#1A2744"} strokeWidth={(layer.strokeWidth ?? 4) * (stageSize / TEXTURE_SIZE_EDITOR)} rotation={layer.rotation ?? 0} offsetX={0} offsetY={0} draggable={!layer.locked} onClick={onSelect} onTap={onSelect} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} />
      {isSelected && <Transformer ref={trRef} enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} rotateEnabled keepRatio={false} boundBoxFunc={(_, newBox) => newBox} />}
    </>
  );
};

const EditableLogoNode = ({ layer, isSelected, stageSize, onSelect, onChange }: { layer: DesignLayer; isSelected: boolean; stageSize: number; onSelect: () => void; onChange: (patch: Partial<DesignLayer>) => void }) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!layer.src) return;
    const image = new window.Image();
    image.onload = () => setImg(image);
    image.src = layer.src;
  }, [layer.src]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!img) return null;

  const px = layer.x * stageSize;
  const py = layer.y * stageSize;
  const w = layer.scaleX * stageSize;
  const h = layer.scaleY * stageSize;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: e.target.x() / stageSize, y: e.target.y() / stageSize });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    onChange({ x: node.x() / stageSize, y: node.y() / stageSize, scaleX: (node.scaleX() * node.width()) / stageSize, scaleY: (node.scaleY() * node.height()) / stageSize, rotation: node.rotation() });
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <>
      <KonvaImage ref={shapeRef} image={img} x={px} y={py} width={w} height={h} offsetX={w / 2} offsetY={h / 2} rotation={layer.rotation ?? 0} draggable={!layer.locked} onClick={onSelect} onTap={onSelect} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} />
      {isSelected && <Transformer ref={trRef} enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} rotateEnabled keepRatio boundBoxFunc={(_, newBox) => newBox} />}
    </>
  );
};

const SafeZoneOverlay = ({ zone, stageSize }: { zone: PrintZoneKey; stageSize: number }) => {
  const z = PRINT_ZONES[zone];
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: stageSize, height: stageSize, pointerEvents: "none" }}>
      <svg width={stageSize} height={stageSize} style={{ position: "absolute", top: 0, left: 0 }}>
        <rect x={z.x * stageSize} y={z.y * stageSize} width={z.w * stageSize} height={z.h * stageSize} fill="none" stroke="rgba(99,179,237,0.55)" strokeWidth={1.5} strokeDasharray="8 5" />
      </svg>
    </div>
  );
};

export const DesignStage = ({ zone, displaySize = 480 }: DesignStageProps) => {
  const layers = useConfiguratorStore((s) => s.layers.filter((l) => l.zone === zone));
  const selectedId = useConfiguratorStore((s) => s.selectedId);
  const selectLayer = useConfiguratorStore((s) => s.selectLayer);
  const updateLayer = useConfiguratorStore((s) => s.updateLayer);
  const stageRef = useRef<Konva.Stage>(null);

  const handleStageClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: Konva.KonvaEventObject<any>) => { if (e.target === stageRef.current) selectLayer(null); },
    [selectLayer],
  );

  return (
    <div style={{ position: "relative", width: displaySize, height: displaySize }}>
      <SafeZoneOverlay zone={zone} stageSize={displaySize} />
      <Stage ref={stageRef} width={displaySize} height={displaySize} onClick={handleStageClick} onTap={handleStageClick} style={{ background: "#1a1a2e", borderRadius: 8 }}>
        <Layer name="numbers">
          {layers.filter((l) => l.type === "number" && l.visible).map((l) => (
            <EditableTextNode key={l.id} layer={l} isSelected={l.id === selectedId} stageSize={displaySize} onSelect={() => selectLayer(l.id)} onChange={(patch) => updateLayer(l.id, patch)} />
          ))}
        </Layer>
        <Layer name="names">
          {layers.filter((l) => l.type === "text" && l.visible).map((l) => (
            <EditableTextNode key={l.id} layer={l} isSelected={l.id === selectedId} stageSize={displaySize} onSelect={() => selectLayer(l.id)} onChange={(patch) => updateLayer(l.id, patch)} />
          ))}
        </Layer>
        <Layer name="logos">
          {layers.filter((l) => l.type === "logo" && l.visible).map((l) => (
            <EditableLogoNode key={l.id} layer={l} isSelected={l.id === selectedId} stageSize={displaySize} onSelect={() => selectLayer(l.id)} onChange={(patch) => updateLayer(l.id, patch)} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
