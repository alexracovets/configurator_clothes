export const shirtNormalFragment = /* glsl */ `
#ifdef USE_NORMALMAP_TANGENTSPACE
  vec3 bakeN = texture2D(uBakeNormal, vRawUv1).xyz;
  normal = normalize(tbn * bakeN);

  #ifdef FLIP_SIDED
    normal = -normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
#endif
`;
