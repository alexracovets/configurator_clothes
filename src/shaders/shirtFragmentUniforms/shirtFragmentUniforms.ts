export const shirtFragmentUniforms = /* glsl */ `
#include <uv_pars_fragment>
varying vec2 vRawUv0;
varying vec2 vRawUv1;
uniform sampler2D uBakeNormal;
uniform sampler2D uFabricNormal;

#ifdef USE_GRADIENT
uniform vec3 uGradientColor2; // linear RGB (THREE.Color)
uniform float uGradientRotation;
uniform float uGradientPosition;
uniform float uGradientSoftness;
uniform float uGradientOpacity;

float shirtGradientMask( vec2 uv ) {
  vec2 dir = vec2( cos( uGradientRotation ), sin( uGradientRotation ) );
  vec2 gradStart = vec2( 0.5 ) - dir * 0.5;
  vec2 gradEnd = vec2( 0.5 ) + dir * 0.5;
  vec2 gradVec = gradEnd - gradStart;
  float t = dot( uv - gradStart, gradVec ) / dot( gradVec, gradVec );
  t = clamp( t, 0.0, 1.0 );

  float mid = uGradientPosition;
  float spread = uGradientSoftness * 0.5;
  float stop0 = max( 0.0, mid - spread );
  float stop1 = min( 1.0, max( mid + spread, stop0 + 0.001 ) );

  return smoothstep( stop0, stop1, t ) * uGradientOpacity;
}
#endif

// Reoriented Normal Mapping — blends two normals in tangent space
vec3 rnmBlend(vec3 n1, vec3 n2) {
  n1 = n1 * vec3( 2.0,  2.0, 2.0) + vec3(-1.0, -1.0, 0.0);
  n2 = n2 * vec3(-2.0, -2.0, 2.0) + vec3( 1.0,  1.0,-1.0);
  return normalize(n1 * dot(n1, n2) - n2 * n1.z);
}
`;
