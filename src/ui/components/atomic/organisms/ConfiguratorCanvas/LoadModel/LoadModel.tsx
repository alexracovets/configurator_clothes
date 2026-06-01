'use client';

import { CrewneckModel, MansShortsModel } from '@organisms';
import { useGarmentStore } from '@store';

const LoadModel = () => {
  const activeGarment = useGarmentStore((s) => s.activeGarment);

  if (activeGarment === 'shorts') return <MansShortsModel />;
  return <CrewneckModel />;
};

export { LoadModel };
