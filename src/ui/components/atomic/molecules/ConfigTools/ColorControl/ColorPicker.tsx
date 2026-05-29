'use client';

import React, { useState } from 'react';

import { PopoverAtom, PopoverAtomContent, PopoverAtomTrigger } from '@atoms';

import { hexToHsva, hsvaToHex, ShadeSlider, Wheel } from '@uiw/react-color';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  trigger: React.ReactElement;
}

const isValidHex = (hex: string) => /^#?[0-9a-fA-F]{3,8}$/.test(hex);

const ColorPicker = ({ color, onChange, trigger }: ColorPickerProps) => {
  const safeColor = isValidHex(color) ? color : '#000000';
  const [wheelHsva, setWheelHsva] = useState({ ...hexToHsva(safeColor), v: 100 });
  const [brightness, setBrightness] = useState(hexToHsva(safeColor).v);

  const handleWheelChange = (newColor: { hsva: { h: number; s: number; v: number; a: number } }) => {
    const next = { ...newColor.hsva, v: 100 };
    setWheelHsva(next);
    onChange(hsvaToHex({ ...next, v: brightness }));
  };

  const handleShadeChange = (newShade: { v: number }) => {
    setBrightness(newShade.v);
    onChange(hsvaToHex({ ...wheelHsva, v: newShade.v }));
  };

  return (
    <PopoverAtom>
      <PopoverAtomTrigger asChild>{trigger}</PopoverAtomTrigger>
      <PopoverAtomContent variant="color_picker">
        <style>
          {`
            .w-color-wheel-fill { width: 25px!important; height: 25px!important; border: 2px solid #fff!important; transform: none!important;}
            .w-color-alpha-horizontal div {border-radius: 999px!important;}
            .w-color-interactive {left: 0!important; top: -20%!important;}
          `}
        </style>
        <Wheel color={wheelHsva} onChange={handleWheelChange} width={241} height={241} />
        <ShadeSlider hsva={{ ...wheelHsva, v: brightness }} onChange={handleShadeChange} style={{ width: '100%', height: 12 }} />
      </PopoverAtomContent>
    </PopoverAtom>
  );
};

export { ColorPicker };
