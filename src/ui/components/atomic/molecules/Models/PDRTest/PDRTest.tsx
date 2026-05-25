"use client";

import { useMemo } from "react";
import { ThreeElements } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useColorStore, usePatternStore, useGradientStore } from "@store";
import type { ShirtPart, PartGradient } from "@store";
import { PatternLayer } from "../../ModalLayers";
import { useSvgTexture } from "@hooks";

interface CrewneckGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_front: THREE.MeshStandardMaterial;
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
}

const MODEL_PATH = "/models/pbr/crewneck.gltf";

// How many times the fabric sprite tiles across the mesh
const FABRIC_REPEAT = 6;

const PART_MESHES: { node: string; part: ShirtPart }[] = [
  { node: "crewneck_front", part: "front" },
  { node: "crewneck_back", part: "back" },
  { node: "crewneck_sleeve_left", part: "sleeve_left" },
  { node: "crewneck_sleeve_right", part: "sleeve_right" },
  { node: "crewneck_collar", part: "collar" },
];

function useColorGradientTexture(
  gradient: PartGradient,
  baseColor: string,
): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    if (gradient.enabled) {
      const cx = size / 2;
      const cy = size / 2;
      const rad = (gradient.rotation * Math.PI) / 180;
      const dx = Math.cos(rad) * size;
      const dy = Math.sin(rad) * size;

      const grad = ctx.createLinearGradient(
        cx - dx / 2,
        cy - dy / 2,
        cx + dx / 2,
        cy + dy / 2,
      );

      const mid = gradient.position / 100;
      const half = (gradient.softness / 100) * 0.5;
      const start = Math.max(0, mid - half);
      const end = Math.min(1, Math.max(mid + half, start + 0.001));
      const a = gradient.opacity / 100;

      const c2 = new THREE.Color(gradient.color2);
      const r = Math.round(c2.r * 255);
      const g = Math.round(c2.g * 255);
      const b = Math.round(c2.b * 255);

      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(start, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(end, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${a})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [gradient, baseColor]);
}

interface PBRMaps {
  /** Baked large-scale normals — UV1 (TEXCOORD_1) */
  bakeNormal: THREE.Texture;
  /** Packed AO (R) + Roughness (G) bake — UV1 (TEXCOORD_1) */
  bakeAoRoughness: THREE.Texture;
  /** Tiled fabric detail normals — UV0 (TEXCOORD_0) */
  fabricNormal: THREE.Texture;
  /** Tiled fabric roughness — UV0 (TEXCOORD_0) */
  fabricRoughness: THREE.Texture;
}

/**
 * Builds a MeshStandardMaterial with a custom shader that:
 *  - samples baked large-scale normals from UV1
 *  - samples tiled fabric detail normals from UV0
 *  - blends them with reoriented normal mapping (RNM)
 *  - uses baked AO (R channel, UV1) and baked roughness (G channel, UV1)
 *  - overlays tiled fabric roughness (UV0) on top
 */
function buildShirtMaterial(
  colorGradientTexture: THREE.CanvasTexture,
  maps: PBRMaps,
): THREE.MeshStandardMaterial {
  // Create fresh material — don't clone GLTF material to avoid inheriting
  // its textures (bake_normal, bake_ao) which we manage ourselves via shader.
  colorGradientTexture.colorSpace = THREE.SRGBColorSpace;

  // Baked AO (R channel) — UV1
  const aoTex = maps.bakeAoRoughness.clone();
  aoTex.channel = 1;
  aoTex.colorSpace = THREE.NoColorSpace;
  aoTex.needsUpdate = true;

  // Dummy 1×1 flat normal — forces Three.js to emit USE_NORMALMAP_TANGENTSPACE
  // so tbn matrix and perturbNormal2Arb are available in the shader.
  // We override the actual sampling in onBeforeCompile.
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
    roughnessMap: null, // не використовуємо — cotton_jersey_rough занадто білий (~0.97)
    roughness: 0.55, // спортивна поліестерова тканина — помірний блиск
    metalness: 0.0,
    normalMap: dummyNormal,
    normalMapType: THREE.TangentSpaceNormalMap,
    normalScale: new THREE.Vector2(0.6, 0.6), // слабші нормалі
    side: THREE.DoubleSide,
  });

  // Extra uniforms
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

    // ── Fragment shader: declare varyings + samplers + RNM helper ─────────
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

      // ── Override normal_fragment_maps ─────────────────────────────────────
      // vRawUv1 → UV1 = baked large-scale normals (no tiling)
      // vRawUv0 → UV0 = tiled fabric detail normals
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `
#ifdef USE_NORMALMAP_TANGENTSPACE
  // Baked large-scale normals — UV1 (raw, no transform)
  vec3 bakeN   = texture2D(uBakeNormal,   vRawUv1).xyz;
  // Tiled fabric detail normals — UV0 (raw, tiled in texture via .repeat)
  vec3 fabricN = texture2D(uFabricNormal, vRawUv0).xyz;

  // RNM blend
  vec3 blendedN = rnmBlend(bakeN, fabricN);
  normal = normalize(tbn * blendedN);

  #ifdef FLIP_SIDED
    normal = -normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
#endif

// roughnessFactor already comes from roughnessMap (cotton_jersey_rough, tiled UV0)
// No additional override needed.
        `,
      );
  };

  m.needsUpdate = true;
  return m;
}

function ShirtMesh({
  geometry,
  baseColor,
  texture,
  patternOpacity,
  patternColor,
  gradient,
  maps,
}: {
  geometry: THREE.BufferGeometry;
  baseColor: string;
  texture: THREE.Texture | null;
  patternOpacity: number;
  patternColor: string;
  gradient: PartGradient;
  maps: PBRMaps;
}) {
  const colorGradientTexture = useColorGradientTexture(gradient, baseColor);

  const mat = useMemo(
    () => buildShirtMaterial(colorGradientTexture, maps),
    [colorGradientTexture, maps],
  );

  return (
    <>
      <mesh geometry={geometry} material={mat} renderOrder={0} />
      {texture && (
        <PatternLayer
          geometry={geometry}
          texture={texture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
        />
      )}
    </>
  );
}

export function PDRTest(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as CrewneckGLTF;
  const { partColors } = useColorStore();
  const { partPatterns, patternOpacity, patternColor } = usePatternStore();
  const { partGradients } = useGradientStore();

  // Load all PBR textures
  const {
    bakeNormal,
    bakeAoRoughness,
    fabricNormal,
    fabricRoughness,
    insideAo,
  } = useTexture({
    bakeNormal: "/models/pbr/bake_normal.jpg",
    bakeAoRoughness: "/models/pbr/bake_ao-bake_roughness.jpg",
    fabricNormal: "/models/pbr/cotton_jersey_nor_gl.jpg",
    fabricRoughness: "/models/pbr/cotton_jersey_rough.jpg",
    insideAo: "/models/pbr/inside_ao.jpg",
  });

  // Mark all maps as linear (non-color)
  useMemo(() => {
    for (const tex of [
      bakeNormal,
      bakeAoRoughness,
      fabricNormal,
      fabricRoughness,
      insideAo,
    ]) {
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
    }
  }, [bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness, insideAo]);

  const maps: PBRMaps = {
    bakeNormal,
    bakeAoRoughness,
    fabricNormal,
    fabricRoughness,
  };

  const patternUrl = (partPatterns as Record<string, string>)["front"] || "";
  const texture = useSvgTexture(patternUrl);

  // Inside material: GLTF material + baked inside AO + tiled fabric normals
  const insideMat = useMemo(() => {
    const m = materials.crewneck_inside.clone();

    const aoTex = insideAo.clone();
    aoTex.colorSpace = THREE.NoColorSpace;
    aoTex.needsUpdate = true;
    m.aoMap = aoTex;
    m.aoMapIntensity = 1.0;

    const fabricNorm = fabricNormal.clone();
    fabricNorm.wrapS = THREE.RepeatWrapping;
    fabricNorm.wrapT = THREE.RepeatWrapping;
    fabricNorm.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT);
    fabricNorm.colorSpace = THREE.NoColorSpace;
    fabricNorm.needsUpdate = true;
    m.normalMap = fabricNorm;
    m.normalMapType = THREE.TangentSpaceNormalMap;
    m.normalScale.set(0.4, 0.4);

    m.roughness = 0.95;
    m.metalness = 0.0;
    m.needsUpdate = true;
    return m;
  }, [materials.crewneck_inside, insideAo, fabricNormal]);

  return (
    <group {...props} dispose={null}>
      {PART_MESHES.map(({ node, part }) => (
        <ShirtMesh
          key={part}
          geometry={nodes[node].geometry}
          baseColor={(partColors as Record<string, string>)[part]}
          texture={texture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
          gradient={partGradients[part]}
          maps={maps}
        />
      ))}
      {/* Inside surface: baked AO + fabric normals */}
      <mesh geometry={nodes.Mesh002.geometry} material={insideMat} />
      {/* Sweatband — has own baked textures from GLTF */}
      <mesh
        geometry={nodes.Mesh002_1.geometry}
        material={materials.sweatband}
      />
      {/* Label */}
      <mesh geometry={nodes.Mesh002_2.geometry} material={materials.label} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
