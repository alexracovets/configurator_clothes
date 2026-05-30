'use client';

import { ColorLayer, DesignOverlayLayer, PatternLayer } from '@molecules';
import { useColorStore, useGradientStore, usePatternStore } from '@store';
import { useBaseColorTexture, useDesignTexture, useSvgTexture } from '@hooks';
import { getPartRenderOrder } from '@utils';
import { PALETTE_COLORS } from '@constants';
import type { LayerConfig, PBRMaps, PrintZoneKey } from '@types';

interface PartLayersProps {
  layer: LayerConfig;
  maps: PBRMaps;
}

const PartLayers = ({ layer, maps }: PartLayersProps) => {
  const { partColors } = useColorStore();
  const { patternUrl, patternOpacity, patternColor } = usePatternStore();
  const { partGradients } = useGradientStore();

  const baseColor = (partColors as Record<string, string>)[layer.part] ?? PALETTE_COLORS[0];
  const gradient = partGradients[layer.part];
  const effectivePatternUrl = patternUrl ?? layer.defaultPatternUrl ?? '';

  const baseColorTexture = useBaseColorTexture(baseColor);
  const patternTexture = useSvgTexture(effectivePatternUrl);
  const partRenderOrder = getPartRenderOrder(layer.part);

  const { texture: designTexture } = useDesignTexture(layer.part as PrintZoneKey);

  return (
    <>
      <ColorLayer
        part={layer.part}
        geometry={layer.geometry}
        baseColorTexture={baseColorTexture}
        gradient={gradient}
        maps={maps}
        renderOrder={partRenderOrder}
      />
      {patternTexture && (
        <PatternLayer
          geometry={layer.geometry}
          texture={patternTexture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
          renderOrder={partRenderOrder + 1}
        />
      )}
      <DesignOverlayLayer part={layer.part} geometry={layer.geometry} designTexture={designTexture} renderOrder={partRenderOrder + 2} />
    </>
  );
};

export { PartLayers };
