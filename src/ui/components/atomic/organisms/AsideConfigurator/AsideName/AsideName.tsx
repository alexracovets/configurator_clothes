'use client';

import { Grid, Text } from '@atoms';
import { useGarmentStore } from '@store';

import { getGarmentConfig } from '@data';

import { GarmentPicker } from './GarmentPicker';

interface AsideNameProps {
  min_buy: number;
  id: number;
}

const AsideName = ({ min_buy, id }: AsideNameProps) => {
  const { styleId, activeGarment } = useGarmentStore();
  const garmentConfig = getGarmentConfig(styleId, activeGarment);

  return (
    <Grid className="grid-cols-[1fr_auto] gap-3">
      <Text variant="product_name" asChild>
        <h3>{garmentConfig.name}</h3>
      </Text>
      <GarmentPicker min_buy={min_buy} number={id} />
    </Grid>
  );
};

export { AsideName };
