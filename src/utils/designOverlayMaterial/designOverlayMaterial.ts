import type { DesignOverlayMaterialOptions, DesignOverlayMaterial } from "@types";
export type { DesignOverlayMaterialOptions, DesignOverlayMaterial };

import * as THREE from "three";

const VERT_INJECT = /* glsl */ `
  varying vec2 vUv2;
`;

const VERT_MAIN_INJECT = /* glsl */ `
  vUv2 = uv;
`;

const FRAG_UNIFORMS = /* glsl */ `
  uniform sampler2D uDesignMap;
  uniform float     uDesignOpacity;
  varying vec2      vUv2;
`;

const FRAG_INJECT = /* glsl */ `
  vec4 design = texture2D(uDesignMap, vUv2);
  outgoingLight = mix(outgoingLight, design.rgb * design.rgb, design.a * uDesignOpacity);
  totalEmissiveRadiance = mix(totalEmissiveRadiance, vec3(0.0), design.a * uDesignOpacity);
`;

const createDesignOverlayMaterial = (opts: DesignOverlayMaterialOptions = {}): DesignOverlayMaterial => {
  const fallback = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
  fallback.needsUpdate = true;

  const extraUniforms = {
    uDesignMap: { value: fallback as THREE.Texture },
    uDesignOpacity: { value: 1.0 },
  };

  const mat = new THREE.MeshPhysicalMaterial({
    map: opts.baseMap ?? null,
    normalMap: opts.normalMap ?? null,
    roughnessMap: opts.roughnessMap ?? null,
    aoMap: opts.aoMap ?? null,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.FrontSide,
  }) as DesignOverlayMaterial;

  mat.uniforms = extraUniforms;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uDesignMap = extraUniforms.uDesignMap;
    shader.uniforms.uDesignOpacity = extraUniforms.uDesignOpacity;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERT_INJECT}`)
      .replace("#include <fog_vertex>", `#include <fog_vertex>\n${VERT_MAIN_INJECT}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_UNIFORMS}`)
      .replace("#include <output_fragment>", `${FRAG_INJECT}\n#include <output_fragment>`);
  };

  mat.setDesignTexture = (tex: THREE.Texture | null) => {
    extraUniforms.uDesignMap.value = tex ?? fallback;
    mat.needsUpdate = true;
  };

  return mat;
};

export { createDesignOverlayMaterial };
