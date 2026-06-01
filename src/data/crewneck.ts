import type { StyleConfig } from './types';

const crewneckStyle: StyleConfig = {
  id: 'crewneck',
  label: 'Crewneck',

  garments: {
    shirt: {
      type: 'shirt',
      label: 'Shirt',
      name: 'Maglia',
      previewUrl: '/models/crewneck/crewneck/designs/crewneck_design_1.svg',

      modelPaths: {
        gltf: '/models/crewneck/crewneck/crewneck.gltf',
        bakeNormal: '/models/crewneck/crewneck/bake_normal.jpg',
        bakeAoRoughness: '/models/crewneck/crewneck/bake_ao-bake_roughness.jpg',
        fabricNormal: '/models/crewneck/crewneck/cotton_jersey_nor_gl.jpg',
        fabricRoughness: '/models/crewneck/crewneck/cotton_jersey_rough.jpg',
        insideAo: '/models/crewneck/crewneck/inside_ao.jpg',
      },

      parts: [
        { key: 'front', label: 'Front', name: 'Davanti' },
        { key: 'back', label: 'Back', name: 'Retro' },
        { key: 'sleeve_left', label: 'Left Sleeve', name: 'Manica 1' },
        { key: 'sleeve_right', label: 'Right Sleeve', name: 'Manica 2' },
      ],

      patterns: [
        {
          id: 'design_0',
          label: 'Design 0',
          url: '/models/crewneck/crewneck/designs/crewneck_design_1.svg',
        },
        {
          id: 'design_01',
          label: 'Design 1',
          url: '/models/crewneck/crewneck/designs/crewneck_design_2_color_1.svg',
        },
        {
          id: 'design_02',
          label: 'Design 2',
          url: '/models/crewneck/crewneck/designs/crewneck_design_2_color_2.svg',
        },
        {
          id: 'design_03',
          label: 'Design 3',
          url: '/models/crewneck/crewneck/designs/crewneck_design_3_color_1.svg',
        },
        {
          id: 'design_04',
          label: 'Design 4',
          url: '/models/crewneck/crewneck/designs/crewneck_design_3_color_2.svg',
        },
        {
          id: 'design_05',
          label: 'Design 5',
          url: '/models/crewneck/crewneck/designs/crewneck_design_4_color_1.svg',
        },
        {
          id: 'design_06',
          label: 'Design 6',
          url: '/models/crewneck/crewneck/designs/crewneck_design_4_color_2.svg',
        },
        {
          id: 'design_07',
          label: 'Design 7',
          url: '/models/crewneck/crewneck/designs/crewneck_design_5_color_1.svg',
        },
        {
          id: 'design_08',
          label: 'Design 8',
          url: '/models/crewneck/crewneck/designs/crewneck_design_5_color_2.svg',
        },
        {
          id: 'design_09',
          label: 'Design 9',
          url: '/models/crewneck/crewneck/designs/crewneck_design_6_color_1.svg',
        },
        {
          id: 'design_10',
          label: 'Design 10',
          url: '/models/crewneck/crewneck/designs/crewneck_design_6_color_2.svg',
        },
        {
          id: 'design_11',
          label: 'Design 11',
          url: '/models/crewneck/crewneck/designs/crewneck_design_7.svg',
        },
        {
          id: 'design_12',
          label: 'Design 12',
          url: '/models/crewneck/crewneck/designs/crewneck_design_8_color_1.svg',
        },
        {
          id: 'design_13',
          label: 'Design 13',
          url: '/models/crewneck/crewneck/designs/crewneck_design_8_color_2.svg',
        },
        {
          id: 'design_14',
          label: 'Design 14',
          url: '/models/crewneck/crewneck/designs/crewneck_design_9_color_1.svg',
        },
        {
          id: 'design_15',
          label: 'Design 15',
          url: '/models/crewneck/crewneck/designs/crewneck_design_9_color_2.svg',
        },
        {
          id: 'design_16',
          label: 'Design 16',
          url: '/models/crewneck/crewneck/designs/crewneck_design_10_color_1.svg',
        },
        {
          id: 'design_17',
          label: 'Design 17',
          url: '/models/crewneck/crewneck/designs/crewneck_design_10_color_2.svg',
        },
        // {
        //   id: 'design_18',
        //   label: 'Design 18',
        //   url: '/models/crewneck/crewneck/designs/crewneck_logos.svg',
        // },
        // {
        //   id: 'design_19',
        //   label: 'Design 19',
        //   url: '/models/crewneck/crewneck/designs/crewneck_raw_pattern.svg',
        // },
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
          interactive: false,
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
          interactive: false,
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
          interactive: false,
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
          interactive: false,
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
          interactive: false,
        },
      ],

      logoPositions: [
        {
          position: 'logo_front',
          label: 'Logo Front',
          zone: 'full',
          uv: { x: 0.66, y: 0.55 },
          default: true,
          rotation: 0,
          defaultSrc: '/logo/logo_1.png',
          scaleX: 0.05,
          scaleY: 0.05,
          slotWidth: 0.07,
          slotHeight: 0.07,
          interactive: false,
        },
        {
          position: 'logo_back',
          label: 'Logo Back',
          zone: 'full',
          uv: { x: 0.16, y: 0.35 },
          default: true,
          rotation: 0,
          defaultSrc: '/logo/logo.png',
          scaleX: 0.1,
          scaleY: 0.1,
          slotWidth: 0.07,
          slotHeight: 0.07,
          interactive: false,
        },
        {
          position: 'logo_sleeve',
          label: 'Logo Manica',
          zone: 'full',
          uv: { x: 0.78, y: 0.35 },
          default: false,
          rotation: 0,
          defaultSrc: '',
          scaleX: 0.08,
          scaleY: 0.08,
          slotWidth: 0.07,
          slotHeight: 0.07,
          interactive: true,
        },
        {
          position: 'logo_chest',
          label: 'Logo Petto',
          zone: 'full',
          uv: { x: 0.58, y: 0.55 },
          default: false,
          rotation: 0,
          defaultSrc: '',
          scaleX: 0.08,
          scaleY: 0.08,
          slotWidth: 0.07,
          slotHeight: 0.07,
          interactive: true,
        },
      ],

      neckColor: '#111111',
      fabricRepeat: 10,
    },

    shorts: {
      type: 'shorts',
      label: 'Shorts',
      name: 'Pantaloncini',
      previewUrl: '/models/crewneck/mans_shorts/designs/mans_shorts_raw_pattern.svg',

      modelPaths: {
        gltf: '/models/crewneck/mans_shorts/mans_shorts.gltf',
        bakeNormal: '/models/crewneck/mans_shorts/outer_normal.png.jpg',
        bakeAoRoughness: '/models/crewneck/mans_shorts/outer_ao.png-outer_roughness.png.jpg',
        fabricNormal: '/models/crewneck/mans_shorts/outer_normal.png.jpg',
        fabricRoughness: '/models/crewneck/mans_shorts/outer_ao.png-outer_roughness.png.jpg',
        insideAo: '/models/crewneck/mans_shorts/inside_ao-inside_roughness.jpg',
      },

      parts: [
        { key: 'left', label: 'Left', name: 'Sinistro' },
        { key: 'right', label: 'Right', name: 'Destro' },
      ],

      patterns: [
        {
          id: 'shorts_pattern',
          label: 'Pattern',
          url: '/models/crewneck/mans_shorts/designs/mans_shorts_raw_pattern.svg',
        },
        {
          id: 'shorts_logo',
          label: 'Logo',
          url: '/models/crewneck/mans_shorts/designs/mans_shorts_logo.svg',
        },
      ],

      namePositions: [],
      numberPositions: [],
      logoPositions: [],

      neckColor: '#111111',
      fabricRepeat: 10,
    },
  },
};

export { crewneckStyle };
