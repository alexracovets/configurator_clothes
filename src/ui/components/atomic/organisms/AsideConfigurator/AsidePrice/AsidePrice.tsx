'use client';

import { Grid, Text } from '@atoms';
import { priceFormat } from '@utils';

interface AsidePriceProps {
  price: number;
  bounus_count: number;
  bonus_discount: number;
}

const AsidePrice = ({ price, bounus_count, bonus_discount }: AsidePriceProps) => {
  return (
    <Grid variant="configurator_price">
      <Text variant="product_price">{priceFormat(price)}</Text>
      <Text className="text-[#6B7280] font-medium">{`>${bounus_count} pezzi +${bonus_discount}% di sconto`}</Text>
    </Grid>
  );
};

export { AsidePrice };
