'use client';

import { GarmentPartMesh } from '@molecules';
import type { LayerConfig, PBRMaps } from '@types';

interface PartLayersProps {
  layer: LayerConfig;
  maps: PBRMaps;
}

const PartLayers = ({ layer, maps }: PartLayersProps) => {
  return <GarmentPartMesh part={layer.part} geometry={layer.geometry} maps={maps} />;
};

export { PartLayers };
