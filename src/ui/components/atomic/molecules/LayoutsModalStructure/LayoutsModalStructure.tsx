"use client";

import type { ThreeElements } from "@react-three/fiber";

import { PartLayers } from "@molecules";

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
      {children}
    </group>
  );
};

export { LayoutsModalStructure };
