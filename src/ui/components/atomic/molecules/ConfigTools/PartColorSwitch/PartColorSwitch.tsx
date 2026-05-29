'use client';

import { Flex, Text } from '@atoms';

interface PartColorSwitchProps {
  label: string;
  color: string;
  badge?: string;
}

const PartColorSwitch = ({ label, color, badge }: PartColorSwitchProps) => (
  <Flex className="gap-2 items-center text-inherit">
    <div className="w-5 h-5 rounded-[3px] shrink-0 border-[.3px] border-gray-30 transition-all duration-200" style={{ background: color }} />
    <Text variant="configurator_part_label">{label}</Text>
    {badge && <Text className="text-[14px] leading-[15px] text-gray-400">{badge}</Text>}
  </Flex>
);

export { PartColorSwitch };
