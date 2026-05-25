"use client";

import * as THREE from "three";

import { useColorStore, usePatternStore, useGradientStore } from "@store";
import { useColorGradientTexture, useSvgTexture } from "@hooks";
import { ColorLayer } from "../ColorLayer";
import { GradientLayer } from "../GradientLayer";
import { PatternLayer } from "../PatternLayer";
import type { PBRMaps } from "@types";
import type { LayerConfig } from "@types";

interface PartLayersProps {
  layer: LayerConfig;
  maps: PBRMaps;
}

export const PartLayers = ({ layer, maps }: PartLayersProps) => {
  const { partColors } = useColorStore();
  const { partPatterns, patternOpacity, patternColor } = usePatternStore();
  const { partGradients } = useGradientStore();

  const baseColor = (partColors as Record<string, string>)[layer.part] ?? "#ffffff";
  const gradient = partGradients[layer.part];
  const patternUrl = (partPatterns as Record<string, string>)[layer.part] || layer.defaultPatternUrl || "";

  const colorGradientTexture = useColorGradientTexture(gradient, baseColor);
  const patternTexture = useSvgTexture(patternUrl);

  return (
    <>
      {/* Layer 0 — base color + PBR */}
      <ColorLayer
        geometry={layer.geometry}
        colorGradientTexture={colorGradientTexture}
        maps={maps}
      />

      {/* Layer 1 — gradient overlay */}
      {gradient.enabled && (
        <GradientLayer
          geometry={layer.geometry}
          texture={colorGradientTexture as unknown as THREE.Texture}
        />
      )}

      {/* Layer 2 — pattern / design */}
      {patternTexture && (
        <PatternLayer
          geometry={layer.geometry}
          texture={patternTexture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
        />
      )}
    </>
  );
};
