import * as THREE from "three";

import type { ShirtPart } from "@types";

export interface LayerConfig {
  part: ShirtPart;
  geometry: THREE.BufferGeometry;
  defaultPatternUrl?: string;
}
