"use client";

import { useMemo } from "react";
import * as THREE from "three";

// How many times the fabric sprite tiles across the mesh
const FABRIC_REPEAT = 6;

export interface PBRMaps {
  /** Baked large-scale normals — UV1 (TEXCOORD_1) */
  bakeNormal: THREE.Texture;
  /** Packed AO (R) + Roughness (G) bake — UV1 (TEXCOORD_1) */
  bakeAoRoughness: THREE.Texture;
  /** Tiled fabric detail normals — UV0 (TEXCOORD_0) */
  fabricNormal: THREE.Texture;
  /** Tiled fabric roughness — UV0 (TEXCOORD_0) */
  fabricRoughness: THREE.Texture;
}

interface ColorLayerProps {
  geometry: THREE.BufferGeometry;
  colorGradientTexture: THREE.CanvasTexture;
  maps: PBRMaps;
}

function buildShirtMaterial(
  colorGradientTexture: THREE.CanvasTexture,
  maps: PBRMaps,
): THREE.MeshStandardMaterial {
  colorGradientTexture.colorSpace = THREE.SRGBColorSpace;

  const aoTex = maps.bakeAoRoughness.clone();
  aoTex.channel = 1;
  aoTex.colorSpace = THREE.NoColorSpace;
  aoTex.needsUpdate = true;

  const dummyNormal = new THREE.DataTexture(
    new Uint8Array([128, 128, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  );
  dummyNormal.needsUpdate = true;

  const m = new THREE.MeshStandardMaterial({
    map: colorGradientTexture,
    aoMap: aoTex,
    aoMapIntensity: 0.6,
    roughnessMap: null,
    roughness: 0.55,
    metalness: 0.0,
    normalMap: dummyNormal,
    normalMapType: THREE.TangentSpaceNormalMap,
    normalScale: new THREE.Vector2(0.6, 0.6),
    side: THREE.DoubleSide,
  });

  const uniformBakeNormal = { value: maps.bakeNormal.clone() };
  uniformBakeNormal.value.colorSpace = THREE.NoColorSpace;
  uniformBakeNormal.value.needsUpdate = true;

  const uniformFabricNormal = { value: maps.fabricNormal.clone() };
  uniformFabricNormal.value.wrapS = THREE.RepeatWrapping;
  uniformFabricNormal.value.wrapT = THREE.RepeatWrapping;
  uniformFabricNormal.value.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT);
  uniformFabricNormal.value.colorSpace = THREE.NoColorSpace;
  uniformFabricNormal.value.needsUpdate = true;

  m.onBeforeCompile = (shader) => {
    shader.uniforms.uBakeNormal = uniformBakeNormal;
    shader.uniforms.uFabricNormal = uniformFabricNormal;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <uv_pars_vertex>",
        /* glsl */ `
#include <uv_pars_vertex>
varying vec2 vRawUv0;
varying vec2 vRawUv1;
        `,
      )
      .replace(
        "#include <uv_vertex>",
        /* glsl */ `
#include <uv_vertex>
vRawUv0 = uv;
#ifdef USE_UV1
  vRawUv1 = uv1;
#else
  vRawUv1 = uv;
#endif
        `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <uv_pars_fragment>",
        /* glsl */ `
#include <uv_pars_fragment>
varying vec2 vRawUv0;
varying vec2 vRawUv1;
uniform sampler2D uBakeNormal;
uniform sampler2D uFabricNormal;

// Reoriented Normal Mapping — inputs [0,1], output [-1,1]
vec3 rnmBlend(vec3 n1, vec3 n2) {
  n1 = n1 * vec3( 2.0,  2.0, 2.0) + vec3(-1.0, -1.0, 0.0);
  n2 = n2 * vec3(-2.0, -2.0, 2.0) + vec3( 1.0,  1.0,-1.0);
  return normalize(n1 * dot(n1, n2) - n2 * n1.z);
}
        `,
      )
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `
#ifdef USE_NORMALMAP_TANGENTSPACE
  vec3 bakeN   = texture2D(uBakeNormal,   vRawUv1).xyz;
  vec3 fabricN = texture2D(uFabricNormal, vRawUv0).xyz;

  vec3 blendedN = rnmBlend(bakeN, fabricN);
  normal = normalize(tbn * blendedN);

  #ifdef FLIP_SIDED
    normal = -normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
#endif
        `,
      );
  };

  m.needsUpdate = true;
  return m;
}

export function ColorLayer({
  geometry,
  colorGradientTexture,
  maps,
}: ColorLayerProps) {
  const mat = useMemo(
    () => buildShirtMaterial(colorGradientTexture, maps),
    [colorGradientTexture, maps],
  );

  return <mesh geometry={geometry} material={mat} renderOrder={0} />;
}
