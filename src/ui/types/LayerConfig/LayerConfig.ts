import * as THREE from 'three';

import type { ConfiguratorPart } from '@types';

export interface LayerConfig {
  part: ConfiguratorPart;
  geometry: THREE.BufferGeometry;
  defaultPatternUrl?: string;
}
