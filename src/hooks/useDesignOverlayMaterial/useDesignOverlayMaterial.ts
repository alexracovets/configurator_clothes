'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { UV0_BOUNDS } from '@utils';
import { shirtFragmentUniforms, shirtVertexUvParsVertex, shirtVertexUvVertex } from '@shaders';
import type { PrintZoneKey, ShirtPart } from '@types';

const OVERLAY_FRAG_UNIFORMS = /* glsl */ `
  uniform sampler2D uDesignMap;
  uniform float     uDesignOpacity;
  uniform vec4      uDesignUvBounds;
`;

const OVERLAY_FRAG_MAIN = /* glsl */ `
  {
    vec2 _zoneUv = (vRawUv0 - uDesignUvBounds.xy) / (uDesignUvBounds.zw - uDesignUvBounds.xy);
    if (_zoneUv.x >= 0.0 && _zoneUv.x <= 1.0 && _zoneUv.y >= 0.0 && _zoneUv.y <= 1.0) {
      vec4 _design = texture2D(uDesignMap, _zoneUv);
      diffuseColor = vec4(_design.rgb, _design.a * uDesignOpacity);
    } else {
      diffuseColor = vec4(0.0);
    }
  }
`;

const useDesignOverlayMaterial = (part: ShirtPart, designTexture: THREE.CanvasTexture): THREE.MeshBasicMaterial => {
  const bounds = UV0_BOUNDS[part as PrintZoneKey] ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 };

  const designUniforms = useRef({
    uDesignMap: { value: designTexture as THREE.Texture },
    uDesignOpacity: { value: 1.0 },
    uDesignUvBounds: {
      value: new THREE.Vector4(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY),
    },
  });

  useLayoutEffect(() => {
    designUniforms.current.uDesignMap.value = designTexture;
  }, [designTexture]);

  return useMemo(() => {
    const du = designUniforms.current;
    const m = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      side: THREE.FrontSide,
    });

    m.customProgramCacheKey = () => `design-overlay-${part}`;

    m.onBeforeCompile = (shader) => {
      shader.uniforms.uDesignMap = du.uDesignMap;
      shader.uniforms.uDesignOpacity = du.uDesignOpacity;
      shader.uniforms.uDesignUvBounds = du.uDesignUvBounds;

      shader.vertexShader = shader.vertexShader
        .replace('#include <uv_pars_vertex>', shirtVertexUvParsVertex)
        .replace('#include <uv_vertex>', shirtVertexUvVertex);

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <uv_pars_fragment>', shirtFragmentUniforms + '\n' + OVERLAY_FRAG_UNIFORMS)
        .replace('#include <map_fragment>', OVERLAY_FRAG_MAIN);
    };

    m.needsUpdate = true;
    return m;
  }, [part]);
};

export { useDesignOverlayMaterial };
