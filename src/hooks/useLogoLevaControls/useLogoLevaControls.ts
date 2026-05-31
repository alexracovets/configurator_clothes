'use client';

import { useEffect } from 'react';

import { folder, useControls } from 'leva';

import { useLogoLevaStore } from '@store';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

const useLogoLevaControls = () => {
  const set = useLogoLevaStore(({ set }) => set);

  const values = useControls(
    Object.fromEntries(
      shirtConfig.logoPositions.map((p) => [
        p.label,
        folder({
          [`${p.position}_x`]: { value: p.uv.x, min: 0, max: 1, step: 0.001, label: 'UV X' },
          [`${p.position}_y`]: { value: p.uv.y, min: 0, max: 1, step: 0.001, label: 'UV Y' },
          [`${p.position}_scaleX`]: { value: p.scaleX, min: 0.01, max: 0.5, step: 0.001, label: 'Scale' },
          [`${p.position}_rotation`]: { value: p.rotation, min: -180, max: 180, step: 1, label: 'Rotation' },
        }),
      ]),
    ),
  );

  useEffect(() => {
    set(values as Record<string, number>);
  }, [values, set]);
};

export { useLogoLevaControls };
