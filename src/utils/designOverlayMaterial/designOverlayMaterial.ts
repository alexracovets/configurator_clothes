import * as THREE from "three";

/**
 * Extends MeshPhysicalMaterial with a design overlay texture.
 *
 * The design layer is alpha-composited ON TOP of the base fabric colour,
 * BEFORE lighting is applied.  This means fabric normals and roughness
 * still modulate the printed area — no "sticker" look.
 *
 * Usage:
 *   const mat = createDesignOverlayMaterial({ baseMap, normalMap, roughnessMap, aoMap })
 *   mat.setDesignTexture(canvasTexture)
 *   // later, when canvas changes:
 *   mat.uniforms.uDesignMap.value.needsUpdate = true
 */

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
  // Sample design texture (flipY=false means UV origin matches texture origin)
  vec4 design = texture2D(uDesignMap, vUv2);
  // Alpha-composite design over the already-computed diffuse
  outgoingLight = mix(outgoingLight, design.rgb * design.rgb, design.a * uDesignOpacity);
  totalEmissiveRadiance = mix(totalEmissiveRadiance, vec3(0.0), design.a * uDesignOpacity);
`;

export interface DesignOverlayMaterialOptions {
  baseMap?:      THREE.Texture | null;
  normalMap?:    THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?:        THREE.Texture | null;
  bakeNormalMap?: THREE.Texture | null;
}

export interface DesignOverlayMaterial extends THREE.MeshPhysicalMaterial {
  uniforms: {
    uDesignMap:     { value: THREE.Texture };
    uDesignOpacity: { value: number };
  };
  setDesignTexture(tex: THREE.Texture | null): void;
}

export function createDesignOverlayMaterial(
  opts: DesignOverlayMaterialOptions = {},
): DesignOverlayMaterial {
  // 1×1 transparent fallback so the uniform is never null
  const fallback = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
  fallback.needsUpdate = true;

  const extraUniforms = {
    uDesignMap:     { value: fallback as THREE.Texture },
    uDesignOpacity: { value: 1.0 },
  };

  const mat = new THREE.MeshPhysicalMaterial({
    map:          opts.baseMap          ?? null,
    normalMap:    opts.normalMap        ?? null,
    roughnessMap: opts.roughnessMap     ?? null,
    aoMap:        opts.aoMap            ?? null,
    roughness:    0.85,
    metalness:    0.0,
    side:         THREE.FrontSide,
  }) as DesignOverlayMaterial;

  mat.uniforms = extraUniforms;

  mat.onBeforeCompile = (shader) => {
    // Expose extra uniforms
    shader.uniforms.uDesignMap     = extraUniforms.uDesignMap;
    shader.uniforms.uDesignOpacity = extraUniforms.uDesignOpacity;

    // Vertex shader — pass UV2 through
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\n${VERT_INJECT}`,
      )
      .replace(
        "#include <fog_vertex>",
        `#include <fog_vertex>\n${VERT_MAIN_INJECT}`,
      );

    // Fragment shader — declare uniforms + inject blend
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\n${FRAG_UNIFORMS}`,
      )
      .replace(
        // Inject right before the final fragment colour output
        "#include <output_fragment>",
        `${FRAG_INJECT}\n#include <output_fragment>`,
      );
  };

  // Custom method: swap design texture at runtime
  mat.setDesignTexture = (tex: THREE.Texture | null) => {
    extraUniforms.uDesignMap.value = tex ?? fallback;
    mat.needsUpdate = true;
  };

  return mat;
}
