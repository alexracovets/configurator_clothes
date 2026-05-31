'use client';

import { Grid, Text } from '@atoms';

import { BadgeProduct } from './BageProduct';

interface AsideNameProps {
  name: string;
  min_buy: number;
  id: number;
}

const AsideName = ({ name, min_buy, id }: AsideNameProps) => {
  return (
    <Grid className="grid-cols-[1fr_auto] gap-3">
      <Text variant="product_name" asChild>
        <h3>{name}</h3>
      </Text>
      <BadgeProduct min_buy={min_buy} number={id} />
    </Grid>
  );
};

export { AsideName };
