"use client";

import { useEffect, useMemo } from "react";

import { createDesignOverlayMaterial } from "@utils";
import { useDesignTexture } from "@hooks";
import type { DesignOverlayMaterial, PartDesignMaterialOptions } from "@types";

const usePartDesignMaterial = ({ zone, baseMap, normalMap, roughnessMap, aoMap, colorTexture }: PartDesignMaterialOptions): DesignOverlayMaterial => {
  const { texture: designTexture } = useDesignTexture(zone);

  const mat = useMemo(
    () => createDesignOverlayMaterial({ baseMap: colorTexture ?? baseMap ?? null, normalMap: normalMap ?? null, roughnessMap: roughnessMap ?? null, aoMap: aoMap ?? null }),
    [baseMap, normalMap, roughnessMap, aoMap, colorTexture],
  );

  useEffect(() => { mat.setDesignTexture(designTexture); }, [mat, designTexture]);

  useEffect(() => { const current = mat; return () => { current.dispose(); }; }, [mat]);

  return mat;
};

export { usePartDesignMaterial };
