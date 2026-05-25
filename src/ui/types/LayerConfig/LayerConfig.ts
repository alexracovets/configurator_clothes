import * as THREE from "three";

import type { ShirtPart } from "@store";

export interface LayerConfig {
  part: ShirtPart;
  geometry: THREE.BufferGeometry;
  defaultPatternUrl?: string;
}
