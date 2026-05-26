"use client";

import type { ThreeElements } from "@react-three/fiber";

import { PartLayers } from "@molecules";
import { DesignLayers } from "@features/configurator/components/DesignLayers";

import type { LayerConfig, PBRTexturePaths } from "@types";
import { usePBRMaps } from "@hooks";

type GroupProps = ThreeElements["group"];

interface LayoutsModalStructureProps extends GroupProps {
  layerConfigs: LayerConfig[];
  pbrTexturePaths: PBRTexturePaths;
  children?: React.ReactNode;
}

const LayoutsModalStructure = ({
  layerConfigs,
  pbrTexturePaths,
  children,
  ...groupProps
}: LayoutsModalStructureProps) => {
  const maps = usePBRMaps(pbrTexturePaths);

  return (
    <group {...groupProps} dispose={null}>
      {layerConfigs.map((layer) => (
        <PartLayers key={layer.part} layer={layer} maps={maps} />
      ))}

      {/*
        DesignLayers — zero R3F output, pure side-effect:
        syncs legacy NameStore / NumberStore → configurator store
        → CanvasTexture → DesignOverlayLayer above PatternLayer.
      */}
      <DesignLayers />

      {children}
    </group>
  );
};

export { LayoutsModalStructure };
