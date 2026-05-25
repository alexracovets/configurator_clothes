export const shirtNormalFragment = /* glsl */ `
#ifdef USE_NORMALMAP_TANGENTSPACE
  // UV1 — baked large-scale normals (no tiling)
  vec3 bakeN   = texture2D(uBakeNormal,   vRawUv1).xyz;
  // UV0 — tiled fabric detail normals
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
`;
