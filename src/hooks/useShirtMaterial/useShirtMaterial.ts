import { useMemo } from "react";
import * as THREE from "three";

import type { PartGradient, ShirtPart } from "@store";
import type { PBRMaps } from "@types";
import {
  shirtVertexUv,
  shirtFragmentUniforms,
  shirtNormalFragment,
  shirtGradientFragment,
} from "@shaders";

const FABRIC_REPEAT = 6;

const PART_POLYGON_OFFSET: Partial<
  Record<ShirtPart, { factor: number; units: number }>
> = {
  sleeve_left: { factor: -1, units: -1 },
  sleeve_right: { factor: -1, units: -1 },
};

/** AO (R) + roughness (G) bake — UV1 */
const createBakeOrmTexture = (bakeAoRoughness: THREE.Texture): THREE.Texture => {
  const tex = bakeAoRoughness.clone();
  tex.channel = 1;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
};

const createDummyNormal = (): THREE.DataTexture => {
  const tex = new THREE.DataTexture(
    new Uint8Array([128, 128, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  );
  tex.needsUpdate = true;
  return tex;
};

const createBakeNormalUniform = (bakeNormal: THREE.Texture) => {
  const tex = bakeNormal.clone();
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return { value: tex };
};

const createFabricNormalUniform = (fabricNormal: THREE.Texture) => {
  const tex = fabricNormal.clone();
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return { value: tex };
};

export const useShirtMaterial = (
  baseColorTexture: THREE.CanvasTexture,
  maps: PBRMaps,
  gradient: PartGradient,
  part?: ShirtPart,
): THREE.MeshStandardMaterial => {
  return useMemo(() => {
    const offset = part ? PART_POLYGON_OFFSET[part] : undefined;
    const colorTex = baseColorTexture.clone() as THREE.CanvasTexture;
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.needsUpdate = true;

    const bakeAo = createBakeOrmTexture(maps.bakeAoRoughness);

    const m = new THREE.MeshStandardMaterial({
      map: colorTex,
      aoMap: bakeAo,
      aoMapIntensity: 0.58,
      roughness: 0.81,
      metalness: 0.0,
      envMapIntensity: 0.38,
      normalMap: createDummyNormal(),
      normalMapType: THREE.TangentSpaceNormalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      side: THREE.DoubleSide,
      ...(offset && {
        polygonOffset: true,
        polygonOffsetFactor: offset.factor,
        polygonOffsetUnits: offset.units,
      }),
    });

    const uBakeNormal = createBakeNormalUniform(maps.bakeNormal);
    const uFabricNormal = createFabricNormalUniform(maps.fabricNormal);

    m.customProgramCacheKey = () =>
      gradient.enabled
        ? `shirt-gradient-${part ?? "x"}`
        : `shirt-base-${part ?? "x"}`;

    m.onBeforeCompile = (shader) => {
      shader.uniforms.uBakeNormal = uBakeNormal;
      shader.uniforms.uFabricNormal = uFabricNormal;

      if (gradient.enabled) {
        shader.defines = { ...shader.defines, USE_GRADIENT: "" };
        shader.uniforms.uGradientColor2 = {
          value: new THREE.Color(gradient.color2),
        };
        shader.uniforms.uGradientRotation = {
          value: (gradient.rotation * Math.PI) / 180,
        };
        shader.uniforms.uGradientPosition = { value: gradient.position / 100 };
        shader.uniforms.uGradientSoftness = { value: gradient.softness / 100 };
        shader.uniforms.uGradientOpacity = { value: gradient.opacity / 100 };
      }

      shader.vertexShader = shader.vertexShader
        .replace("#include <uv_pars_vertex>", shirtVertexUv.uvParsVertex)
        .replace("#include <uv_vertex>", shirtVertexUv.uvVertex);

      let fragmentShader = shader.fragmentShader
        .replace("#include <uv_pars_fragment>", shirtFragmentUniforms)
        .replace("#include <normal_fragment_maps>", shirtNormalFragment);

      if (gradient.enabled) {
        fragmentShader = fragmentShader.replace(
          "#include <map_fragment>",
          shirtGradientFragment,
        );
      }

      shader.fragmentShader = fragmentShader;
    };

    m.needsUpdate = true;
    return m;
  }, [baseColorTexture, maps, gradient, part]);
};
