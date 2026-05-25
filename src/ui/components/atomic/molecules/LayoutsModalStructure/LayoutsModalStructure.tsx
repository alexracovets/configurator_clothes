"use client";

import { useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";

import { PartLayers, NameLayer, NumberLayer } from "@molecules";

import type { LayerConfig, PBRTexturePaths } from "@types";
import { usePBRMaps } from "@hooks";
import { useNameStore, useNumberStore } from "@store";

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
  const isNameVisible = useNameStore(({ isVisible }) => isVisible);
  const isNumberVisible = useNumberStore(({ isVisible }) => isVisible);

  const backGeometry = useMemo(
    () => layerConfigs.find((l) => l.part === "back")?.geometry ?? null,
    [layerConfigs],
  );

  const frontGeometry = useMemo(
    () => layerConfigs.find((l) => l.part === "front")?.geometry ?? null,
    [layerConfigs],
  );

  return (
    <group {...groupProps} dispose={null}>
      {layerConfigs.map((layer) => (
        <PartLayers key={layer.part} layer={layer} maps={maps} />
      ))}

      {backGeometry && (
        <mesh geometry={backGeometry} renderOrder={5}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          {isNameVisible && <NameLayer />}
        </mesh>
      )}

      {frontGeometry && (
        <mesh geometry={frontGeometry} renderOrder={5}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          {isNumberVisible && <NumberLayer />}
        </mesh>
      )}

      {children}
    </group>
  );
};

export { LayoutsModalStructure };
