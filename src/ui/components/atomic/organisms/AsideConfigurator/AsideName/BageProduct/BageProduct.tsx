"use client";

import { Flex, Text } from "@atoms";

interface BageProductProps {
  min_buy: number;
  number: number;
}

const BageProduct = ({ min_buy, number }: BageProductProps) => {
  return (
    <Flex className="flex-col items-start px-3 py-2 rounded-[4px] bg-primary">
      <Text className="font-semibold"> Prodotto {number + 1}</Text>
      <Text className="text-[14px] text-gray"> Minimo {min_buy} pz</Text>
    </Flex>
  );
};

export { BageProduct };
