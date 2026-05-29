'use client';

import { AtomSelect, Flex, Text } from '@atoms';
import { fontCssFamily } from '@utils';
import { FONTS } from '@constants';

interface FontSelectRowProps {
  font: string;
  onChange: (font: string) => void;
}

const FontSelectRow = ({ font, onChange }: FontSelectRowProps) => {
  const activeFont = FONTS.find(({ value }) => value === font) ?? FONTS[0];

  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_part_label">Carattere</Text>
      <AtomSelect
        variant="font"
        options={FONTS.map((f) => ({ label: f.label, value: f.value, fontFamily: fontCssFamily(f.value) }))}
        value={{ label: activeFont.label, value: activeFont.value, fontFamily: fontCssFamily(activeFont.value) }}
        onChange={({ value }) => onChange(value)}
        icon
      />
    </Flex>
  );
};

export { FontSelectRow };
