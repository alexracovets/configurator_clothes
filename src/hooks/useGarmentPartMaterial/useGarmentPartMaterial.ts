import { useEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { UV0_BOUNDS } from '@utils';
import {
  garmentPartMapFragment,
  shirtFragmentUniforms,
  shirtNormalFragment,
  shirtRoughnessFragment,
  shirtVertexUvParsVertex,
  shirtVertexUvVertex,
} from '@shaders';
import { FABRIC_REPEAT } from '@constants';
import type { ConfiguratorPart, PBRMaps } from '@types';

const PART_POLYGON_OFFSET: Partial<Record<ConfiguratorPart, { factor: number; units: number }>> = {
  sleeve_left: { factor: -1, units: -1 },
  sleeve_right: { factor: -1, units: -1 },
};

const PART_MAP_UNIFORMS = /* glsl */ `
uniform vec4 uPartUvBounds;
`;

const createBakeOrmTexture = (bakeAoRoughness: THREE.Texture): THREE.Texture => {
  const tex = bakeAoRoughness.clone();
  tex.channel = 1;
  tex.flipY = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
};

const createDummyNormal = (): THREE.DataTexture => {
  const tex = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
};

const createBakeNormalUniform = (bakeNormal: THREE.Texture) => {
  const tex = bakeNormal.clone();
  tex.flipY = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return { value: tex };
};

const createFabricRoughnessMap = (fabricRoughness: THREE.Texture): THREE.Texture => {
  const tex = fabricRoughness.clone();
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT);
  tex.flipY = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
};

const useGarmentPartMaterial = (partAtlas: THREE.CanvasTexture, maps: PBRMaps, part?: ConfiguratorPart): THREE.MeshStandardMaterial => {
  const bounds = part ? (UV0_BOUNDS[part as keyof typeof UV0_BOUNDS] ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 }) : { minX: 0, minY: 0, maxX: 1, maxY: 1 };

  const partUvUniforms = useRef({
    uPartUvBounds: {
      value: new THREE.Vector4(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY),
    },
  });

  useEffect(() => {
    partUvUniforms.current.uPartUvBounds.value.set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  }, [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);

  const material = useMemo(() => {
    const offset = part ? PART_POLYGON_OFFSET[part] : undefined;

    const bakeAo = createBakeOrmTexture(maps.bakeAoRoughness);
    const fabricRough = createFabricRoughnessMap(maps.fabricRoughness);
    const fabricBump = createFabricRoughnessMap(maps.fabricRoughness);

    const m = new THREE.MeshStandardMaterial({
      map: partAtlas,
      aoMap: bakeAo,
      aoMapIntensity: 0.58,
      roughnessMap: fabricRough,
      bumpMap: fabricBump,
      bumpScale: 0.006,
      roughness: 1,
      metalness: 0.0,
      envMapIntensity: 0.28,
      normalMap: createDummyNormal(),
      normalMapType: THREE.TangentSpaceNormalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      side: THREE.FrontSide,
      ...(offset && {
        polygonOffset: true,
        polygonOffsetFactor: offset.factor,
        polygonOffsetUnits: offset.units,
      }),
    });

    const uBakeNormal = createBakeNormalUniform(maps.bakeNormal);
    const pu = partUvUniforms.current;

    m.customProgramCacheKey = () => `garment-part-atlas-${part ?? 'x'}`;

    m.onBeforeCompile = (shader) => {
      shader.defines = { ...shader.defines, USE_UV1: '' };
      shader.uniforms.uBakeNormal = uBakeNormal;
      shader.uniforms.uPartUvBounds = pu.uPartUvBounds;

      shader.vertexShader = shader.vertexShader
        .replace('#include <uv_pars_vertex>', shirtVertexUvParsVertex)
        .replace('#include <uv_vertex>', shirtVertexUvVertex);

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <uv_pars_fragment>', shirtFragmentUniforms + '\n' + PART_MAP_UNIFORMS)
        .replace('#include <map_fragment>', garmentPartMapFragment)
        .replace('#include <normal_fragment_maps>', shirtNormalFragment)
        .replace('#include <roughnessmap_fragment>', shirtRoughnessFragment);
    };

    m.needsUpdate = true;
    return m;
  }, [maps, part, partAtlas]);

  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    material.map = partAtlas;
    invalidate();
  }, [partAtlas, material, invalidate]);

  return material;
};

export { useGarmentPartMaterial };
