export const shirtFragmentUniforms = /* glsl */ `
#include <uv_pars_fragment>
varying vec2 vRawUv0;
varying vec2 vRawUv1;
uniform sampler2D uBakeNormal;
uniform sampler2D uFabricNormal;

// Reoriented Normal Mapping — blends two normals in tangent space
vec3 rnmBlend(vec3 n1, vec3 n2) {
  n1 = n1 * vec3( 2.0,  2.0, 2.0) + vec3(-1.0, -1.0, 0.0);
  n2 = n2 * vec3(-2.0, -2.0, 2.0) + vec3( 1.0,  1.0,-1.0);
  return normalize(n1 * dot(n1, n2) - n2 * n1.z);
}
`;
