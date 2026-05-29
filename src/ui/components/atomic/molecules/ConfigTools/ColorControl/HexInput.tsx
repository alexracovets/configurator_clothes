'use client';

import { useState } from 'react';

import { AtomInput } from '@atoms';

interface HexInputProps {
  value: string;
  onChange: (color: string) => void;
}

const HexInput = ({ value, onChange }: HexInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const withHash = raw.startsWith('#') ? raw : '#' + raw;
    setDraft(withHash);
    if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
      onChange(withHash);
    }
  };

  const handleBlur = () => {
    if (draft !== null && !/^#[0-9a-fA-F]{6}$/.test(draft)) {
      setDraft(null);
    } else {
      setDraft(null);
    }
  };

  return (
    <AtomInput
      variant="color_picker"
      size="color_picker"
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="#ffffff"
      maxLength={7}
      spellCheck={false}
    />
  );
};

export { HexInput };
