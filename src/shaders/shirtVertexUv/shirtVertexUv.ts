export const shirtVertexUv = {
  uvParsVertex: /* glsl */ `
#include <uv_pars_vertex>
varying vec2 vRawUv0;
varying vec2 vRawUv1;
  `,

  uvVertex: /* glsl */ `
#include <uv_vertex>
vRawUv0 = uv;
#ifdef USE_UV1
  vRawUv1 = uv1;
#else
  vRawUv1 = uv;
#endif
  `,
};
