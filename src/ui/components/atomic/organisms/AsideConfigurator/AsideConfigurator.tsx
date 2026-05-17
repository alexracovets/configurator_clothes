"use client";

import { Flex, Grid, Text } from "@atoms";

import { AsidePrice } from "./AsidePrice";
import { AsideName } from "./AsideName";

const AsideConfigurator = () => {
  const data = {
    name: "Maglia Federer",
    min_buy: 5,
    bounus_count: 25,
    bonus_discount: 10,
    price: 100,
    id: 0,
  };

  return (
    <aside className="min-h-0 relative z-1">
      <Flex className="flex-col items-start">
        <AsideName name={data.name} min_buy={data.min_buy} id={data.id} />
        <AsidePrice
          price={data.price}
          bounus_count={data.bounus_count}
          bonus_discount={data.bonus_discount}
        />
      </Flex>
    </aside>
  );
};

export { AsideConfigurator };
