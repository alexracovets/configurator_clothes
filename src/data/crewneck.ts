import type { StyleConfig } from './types';

const crewneckStyle: StyleConfig = {
  id: 'crewneck',
  label: 'Crewneck',

  garments: {
    shirt: {
      type: 'shirt',
      label: 'Shirt',
      name: 'Maglia',

      modelPaths: {
        gltf: '/models/pbr/crewneck.gltf',
        bakeNormal: '/models/pbr/bake_normal.jpg',
        bakeAoRoughness: '/models/pbr/bake_ao-bake_roughness.jpg',
        fabricNormal: '/models/pbr/cotton_jersey_nor_gl.jpg',
        fabricRoughness: '/models/pbr/cotton_jersey_rough.jpg',
        insideAo: '/models/pbr/inside_ao.jpg',
      },

      parts: [
        { key: 'front', label: 'Front', name: 'Davanti' },
        { key: 'back', label: 'Back', name: 'Retro' },
        { key: 'sleeve_left', label: 'Left Sleeve', name: 'Manica 1' },
        { key: 'sleeve_right', label: 'Right Sleeve', name: 'Manica 2' },
      ],

      patterns: [
        { id: 'design_0', label: 'Design 0', url: '/models/crewneck/designs/design_0.svg' },
        { id: 'design_01', label: 'Design 1', url: '/models/crewneck/designs/design_01.png' },
      ],

      namePositions: [
        {
          position: 'top',
          label: 'Top Back',
          uv: { x: 0.76, y: 0.5 },
          rotation: 90,
          fontSize: 92,
          slotWidth: 0.56,
          slotHeight: 0.12,
          slotOffsetX: 0.008,
        },
        {
          position: 'bottom',
          label: 'Bottom Back',
          uv: { x: 0.2, y: 0.5 },
          rotation: 90,
          fontSize: 92,
          slotWidth: 0.56,
          slotHeight: 0.12,
          slotOffsetX: 0.008,
        },
      ],

      numberPositions: [
        {
          position: 'front_left',
          label: 'Front Left',
          zone: 'front',
          uv: { x: 0.4, y: 0.5 },
          rotation: -90,
          fontSize: 128,
          slotWidth: 0.16,
          slotHeight: 0.14,
          slotOffsetX: -0.01,
        },
        {
          position: 'front_right',
          label: 'Front Right',
          zone: 'front',
          uv: { x: 0.32, y: 0.28 },
          rotation: -90,
          fontSize: 128,
          slotWidth: 0.16,
          slotHeight: 0.14,
          slotOffsetX: -0.01,
        },
        {
          position: 'back',
          label: 'Back',
          zone: 'back',
          uv: { x: 0.5, y: 0.5 },
          rotation: 90,
          fontSize: 420,
          slotWidth: 0.39,
          slotHeight: 0.36,
          slotOffsetX: 0.04,
        },
      ],

      neckColor: '#111111',
      fabricRepeat: 10,
    },
  },
};

export { crewneckStyle };
