"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { PartGradient, ShirtPart } from "@store";
import type { PBRMaps } from "@types";
import { UV0_BOUNDS } from "@utils";
import { shirtVertexUvParsVertex, shirtVertexUvVertex, shirtFragmentUniforms, shirtNormalFragment, shirtGradientFragment, shirtRoughnessFragment } from "@shaders";
import type { PrintZoneKey } from "@utils";

const FABRIC_REPEAT = 10;

const PART_POLYGON_OFFSET: Partial<Record<ShirtPart, { factor: number; units: number }>> = {
  sleeve_left:  { factor: -1, units: -1 },
  sleeve_right: { factor: -1, units: -1 },
};

const DESIGN_FRAG_UNIFORMS = /* glsl */ `
  uniform sampler2D uDesignMap;
  uniform float     uDesignOpacity;
  uniform vec4      uDesignUvBounds;
`;

const DESIGN_FRAG_BLEND = /* glsl */ `
  {
    vec2 _uv = (vRawUv0 - uDesignUvBounds.xy) / (uDesignUvBounds.zw - uDesignUvBounds.xy);
    if (_uv.x >= 0.0 && _uv.x <= 1.0 && _uv.y >= 0.0 && _uv.y <= 1.0) {
      vec4 _design = texture2D(uDesignMap, _uv);
      float _alpha = _design.a * uDesignOpacity;
      outgoingLight = mix(outgoingLight, _design.rgb, _alpha);
    }
  }
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

const useShirtDesignMaterial = (baseColorTexture: THREE.CanvasTexture, maps: PBRMaps, gradient: PartGradient, part: ShirtPart | undefined, designTexture: THREE.CanvasTexture): THREE.MeshStandardMaterial => {
  const bounds = UV0_BOUNDS[part as PrintZoneKey] ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 };

  const designUniforms = useRef({
    uDesignMap:      { value: designTexture as THREE.Texture },
    uDesignOpacity:  { value: 1.0 },
    uDesignUvBounds: { value: new THREE.Vector4(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY) },
  });

  useLayoutEffect(() => { designUniforms.current.uDesignMap.value = designTexture; }, [designTexture]);

  return useMemo(() => {
    const offset = part ? PART_POLYGON_OFFSET[part] : undefined;
    const colorTex = baseColorTexture.clone() as THREE.CanvasTexture;
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.needsUpdate = true;
    const bakeAo = createBakeOrmTexture(maps.bakeAoRoughness);
    const fabricRough = createFabricRoughnessMap(maps.fabricRoughness);
    const fabricBump = createFabricRoughnessMap(maps.fabricRoughness);
    const m = new THREE.MeshStandardMaterial({
      map: colorTex, aoMap: bakeAo, aoMapIntensity: 0.58, roughnessMap: fabricRough,
      bumpMap: fabricBump, bumpScale: 0.006, roughness: 1, metalness: 0.0, envMapIntensity: 0.28,
      normalMap: createDummyNormal(), normalMapType: THREE.TangentSpaceNormalMap,
      normalScale: new THREE.Vector2(0.5, 0.5), side: THREE.FrontSide,
      ...(offset && { polygonOffset: true, polygonOffsetFactor: offset.factor, polygonOffsetUnits: offset.units }),
    });
    const uBakeNormal = createBakeNormalUniform(maps.bakeNormal);
    const du = designUniforms.current;
    m.customProgramCacheKey = () => gradient.enabled ? `shirt-design-gradient-${part ?? "x"}` : `shirt-design-base-${part ?? "x"}`;
    m.onBeforeCompile = (shader) => {
      shader.defines = { ...shader.defines, USE_UV1: "" };
      shader.uniforms.uBakeNormal = uBakeNormal;
      if (gradient.enabled) {
        shader.defines = { ...shader.defines, USE_GRADIENT: "" };
        shader.uniforms.uGradientColor2   = { value: new THREE.Color(gradient.color2) };
        shader.uniforms.uGradientRotation = { value: (gradient.rotation * Math.PI) / 180 };
        shader.uniforms.uGradientPosition = { value: gradient.position / 100 };
        shader.uniforms.uGradientSoftness = { value: gradient.softness / 100 };
        shader.uniforms.uGradientOpacity  = { value: gradient.opacity / 100 };
      }
      shader.uniforms.uDesignMap      = du.uDesignMap;
      shader.uniforms.uDesignOpacity  = du.uDesignOpacity;
      shader.uniforms.uDesignUvBounds = du.uDesignUvBounds;
      shader.vertexShader = shader.vertexShader
        .replace("#include <uv_pars_vertex>", shirtVertexUvParsVertex)
        .replace("#include <uv_vertex>", shirtVertexUvVertex);
      let frag = shader.fragmentShader
        .replace("#include <uv_pars_fragment>", shirtFragmentUniforms + "\n" + DESIGN_FRAG_UNIFORMS)
        .replace("#include <normal_fragment_maps>", shirtNormalFragment)
        .replace("#include <roughnessmap_fragment>", shirtRoughnessFragment);
      if (gradient.enabled) frag = frag.replace("#include <map_fragment>", shirtGradientFragment);
      frag = frag.replace("#include <opaque_fragment>", `${DESIGN_FRAG_BLEND}\n#include <opaque_fragment>`);
      shader.fragmentShader = frag;
    };
    m.needsUpdate = true;
    return m;
  }, [baseColorTexture, maps, gradient, part]);
};

export { useShirtDesignMaterial };
