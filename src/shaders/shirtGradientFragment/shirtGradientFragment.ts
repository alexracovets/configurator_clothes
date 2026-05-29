const shirtGradientFragment = /* glsl */ `
#include <map_fragment>
#ifdef USE_GRADIENT
  float gradMask = shirtGradientMask( vMapUv );
  diffuseColor.rgb = mix( diffuseColor.rgb, uGradientColor2, gradMask );
#endif
`;

export { shirtGradientFragment };
