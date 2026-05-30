'use client';

import { ColorControl, PartColorSwitch, RangeControl, ToggleControl } from '@molecules';
import { AcordionAtom, Flex } from '@atoms';
import { SHIRT_PARTS, useColorStore, useGradientStore } from '@store';

const StepSfumatura = () => {
  const { partGradients, setPartGradient } = useGradientStore();
  const { partColors } = useColorStore();

  const items = SHIRT_PARTS.map(({ key, name }) => {
    const gradient = partGradients[key];
    const color1 = partColors[key];
    const previewGrad = gradient.enabled ? `linear-gradient(${gradient.rotation}deg, ${color1} ${gradient.position}%, ${gradient.color2})` : color1;

    return {
      value: key,
      trigger: <PartColorSwitch label={name} color={previewGrad} badge={gradient.enabled ? 'sfumatura attiva' : undefined} />,
      content: (
        <Flex variant="configurator_part" className="gap-7">
          <ToggleControl label="Sfumatura" value={gradient.enabled} onChange={(enabled) => setPartGradient(key, { enabled })} />
          {gradient.enabled && (
            <>
              <Flex variant="configurator_part">
                <div className="w-[60px] h-[60px] rounded-[8px] border border-gray-200" style={{ backgroundColor: color1 }} />
              </Flex>
              <ColorControl label="Colore 2" activeColor={gradient.color2} onSelect={(color) => setPartGradient(key, { color2: color })} />
              <RangeControl label="Rotazione" value={gradient.rotation} onChange={(v) => setPartGradient(key, { rotation: v })} min={0} max={360} unit="°" />
              <RangeControl label="Posizione linea" value={gradient.position} onChange={(v) => setPartGradient(key, { position: v })} unit="%" />
              <RangeControl label="Morbidezza" value={gradient.softness} onChange={(v) => setPartGradient(key, { softness: v })} unit="%" />
              <RangeControl label="Trasparenza" value={gradient.opacity} onChange={(v) => setPartGradient(key, { opacity: v })} unit="%" />
            </>
          )}
        </Flex>
      ),
    };
  });

  return (
    <Flex variant="step_design">
      <AcordionAtom items={items} defaultValue={['front']} className="gap-3" />
    </Flex>
  );
};

export { StepSfumatura };
