'use client';

import { useEffect } from 'react';

import { useControls } from 'leva';

import { useConfiguratorStore } from '@store';
import { setDesignSlots } from '@hooks';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;
const p = shirtConfig.numberPositions;

const NumberPositionsDebug = () => {
  const fl = useControls('Front Left', {
    uv_x: { value: p[0].uv.x, min: 0, max: 1, step: 0.001 },
    uv_y: { value: p[0].uv.y, min: 0, max: 1, step: 0.001 },
    rotation: { value: p[0].rotation, min: -180, max: 180, step: 1 },
    fontSize: { value: p[0].fontSize, min: 16, max: 400, step: 1 },
    slotW: { value: p[0].slotWidth, min: 0.01, max: 1, step: 0.01 },
    slotH: { value: p[0].slotHeight, min: 0.01, max: 1, step: 0.01 },
    offsetX: { value: p[0].slotOffsetX ?? 0, min: -0.1, max: 0.1, step: 0.001 },
    offsetY: { value: p[0].slotOffsetY ?? 0, min: -0.1, max: 0.1, step: 0.001 },
  });

  const fr = useControls('Front Right', {
    uv_x: { value: p[1].uv.x, min: 0, max: 1, step: 0.001 },
    uv_y: { value: p[1].uv.y, min: 0, max: 1, step: 0.001 },
    rotation: { value: p[1].rotation, min: -180, max: 180, step: 1 },
    fontSize: { value: p[1].fontSize, min: 16, max: 400, step: 1 },
    slotW: { value: p[1].slotWidth, min: 0.01, max: 1, step: 0.01 },
    slotH: { value: p[1].slotHeight, min: 0.01, max: 1, step: 0.01 },
    offsetX: { value: p[1].slotOffsetX ?? 0, min: -0.1, max: 0.1, step: 0.001 },
    offsetY: { value: p[1].slotOffsetY ?? 0, min: -0.1, max: 0.1, step: 0.001 },
  });

  const back = useControls('Back Number', {
    uv_x: { value: p[2].uv.x, min: 0, max: 1, step: 0.001 },
    uv_y: { value: p[2].uv.y, min: 0, max: 1, step: 0.001 },
    rotation: { value: p[2].rotation, min: -180, max: 180, step: 1 },
    fontSize: { value: p[2].fontSize, min: 16, max: 400, step: 1 },
    slotW: { value: p[2].slotWidth, min: 0.01, max: 1, step: 0.01 },
    slotH: { value: p[2].slotHeight, min: 0.01, max: 1, step: 0.01 },
    offsetX: { value: p[2].slotOffsetX ?? 0, min: -0.1, max: 0.1, step: 0.001 },
    offsetY: { value: p[2].slotOffsetY ?? 0, min: -0.1, max: 0.1, step: 0.001 },
  });

  // Update layer positions
  useEffect(() => {
    const { layers, updateLayer } = useConfiguratorStore.getState();
    for (const layer of layers) {
      if (layer.type !== 'number') continue;
      const pos = layer.zone === 'front' ? (layer.x < 0.5 ? fl : fr) : back;
      updateLayer(layer.id, { x: pos.uv_x, y: pos.uv_y, rotation: pos.rotation, fontSize: pos.fontSize });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fl.uv_x, fl.uv_y, fl.rotation, fl.fontSize, fr.uv_x, fr.uv_y, fr.rotation, fr.fontSize, back.uv_x, back.uv_y, back.rotation, back.fontSize]);

  // Update slot frames
  useEffect(() => {
    setDesignSlots('front', [
      { x: fl.uv_x + fl.offsetX, y: fl.uv_y + fl.offsetY, rotation: fl.rotation, widthFraction: fl.slotW, heightFraction: fl.slotH },
      { x: fr.uv_x + fr.offsetX, y: fr.uv_y + fr.offsetY, rotation: fr.rotation, widthFraction: fr.slotW, heightFraction: fr.slotH },
    ]);
    setDesignSlots('back', [
      { x: back.uv_x + back.offsetX, y: back.uv_y + back.offsetY, rotation: back.rotation, widthFraction: back.slotW, heightFraction: back.slotH },
    ]);
  }, [
    fl.uv_x,
    fl.uv_y,
    fl.rotation,
    fl.slotW,
    fl.slotH,
    fl.offsetX,
    fl.offsetY,
    fr.uv_x,
    fr.uv_y,
    fr.rotation,
    fr.slotW,
    fr.slotH,
    fr.offsetX,
    fr.offsetY,
    back.uv_x,
    back.uv_y,
    back.rotation,
    back.slotW,
    back.slotH,
    back.offsetX,
    back.offsetY,
  ]);

  return null;
};

export { NumberPositionsDebug };
