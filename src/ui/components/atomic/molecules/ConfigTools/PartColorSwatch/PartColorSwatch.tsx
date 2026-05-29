"use client";

import { Flex, Text } from "@atoms";

interface PartColorSwatchProps {
  label: string;
  color: string;
  badge?: string;
}

const PartColorSwatch = ({ label, color, badge }: PartColorSwatchProps) => (
  <Flex className="gap-3 items-center">
    <div className="w-5 h-5 rounded-[4px] border border-gray-200 shrink-0" style={{ background: color }} />
    <Text className="text-sm font-medium text-gray-800">{label}</Text>
    {badge && <Text className="text-[14px] leading-[15px] text-gray-400">{badge}</Text>}
  </Flex>
);

export { PartColorSwatch };
