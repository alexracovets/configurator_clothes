const garmentPartMapFragment = /* glsl */ `
#ifdef USE_MAP
  vec2 partUv = ( vRawUv0 - uPartUvBounds.xy ) / ( uPartUvBounds.zw - uPartUvBounds.xy );
  vec4 texelColor = texture2D( map, partUv );
  diffuseColor *= texelColor;
#endif
`;

export { garmentPartMapFragment };
