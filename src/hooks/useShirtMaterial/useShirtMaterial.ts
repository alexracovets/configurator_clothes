import { useMemo } from "react";
import * as THREE from "three";

import type { PBRMaps } from "@types";
import {
  shirtVertexUv,
  shirtFragmentUniforms,
  shirtNormalFragment,
} from "@shaders";

const FABRIC_REPEAT = 6;

const createAoTexture = (bakeAoRoughness: THREE.Texture): THREE.Texture => {
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
  colorGradientTexture: THREE.CanvasTexture,
  maps: PBRMaps,
): THREE.MeshStandardMaterial => {
  return useMemo(() => {
    const colorTex = colorGradientTexture.clone() as THREE.CanvasTexture;
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.needsUpdate = true;

    const m = new THREE.MeshStandardMaterial({
      map: colorTex,
      aoMap: createAoTexture(maps.bakeAoRoughness),
      aoMapIntensity: 0.6,
      roughnessMap: null,
      roughness: 0.55,
      metalness: 0.0,
      normalMap: createDummyNormal(),
      normalMapType: THREE.TangentSpaceNormalMap,
      normalScale: new THREE.Vector2(0.6, 0.6),
      side: THREE.DoubleSide,
    });

    const uBakeNormal = createBakeNormalUniform(maps.bakeNormal);
    const uFabricNormal = createFabricNormalUniform(maps.fabricNormal);

    m.onBeforeCompile = (shader) => {
      shader.uniforms.uBakeNormal = uBakeNormal;
      shader.uniforms.uFabricNormal = uFabricNormal;

      shader.vertexShader = shader.vertexShader
        .replace("#include <uv_pars_vertex>", shirtVertexUv.uvParsVertex)
        .replace("#include <uv_vertex>", shirtVertexUv.uvVertex);

      shader.fragmentShader = shader.fragmentShader
        .replace("#include <uv_pars_fragment>", shirtFragmentUniforms)
        .replace("#include <normal_fragment_maps>", shirtNormalFragment);
    };

    m.needsUpdate = true;
    return m;
  }, [colorGradientTexture, maps]);
};
