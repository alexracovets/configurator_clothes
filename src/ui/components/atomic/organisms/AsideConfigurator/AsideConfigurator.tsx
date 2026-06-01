'use client';

import { useEffect, useRef } from 'react';

import { StepColor, StepDesign, StepLogo, StepName, StepNumber, StepSfumatura } from '@molecules';
import { Flex, Grid } from '@atoms';
import { ScrollArea } from '@shared';
import { useStepsStore } from '@store';
import { registerAsideOrbitGuard } from '@utils';
import type { StepValue } from '@constants';

import { AsideName } from './AsideName';
import { AsidePrice } from './AsidePrice';

const STEP_PANELS: { step: StepValue; Component: React.ComponentType }[] = [
  { step: 'color', Component: StepColor },
  { step: 'design', Component: StepDesign },
  { step: 'shading', Component: StepSfumatura },
  { step: 'name', Component: StepName },
  { step: 'number', Component: StepNumber },
  { step: 'logo', Component: StepLogo },
];

const AsideConfigurator = () => {
  const asideRef = useRef<HTMLElement>(null);
  const currentStepValue = useStepsStore(({ currentStepValue }) => currentStepValue);

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return undefined;
    return registerAsideOrbitGuard(el);
  }, []);

  const data = {
    name: 'Maglia Federer',
    min_buy: 5,
    bounus_count: 25,
    bonus_discount: 10,
    price: 100,
    id: 0,
  };

  const hasPanel = STEP_PANELS.some((p) => p.step === currentStepValue);

  return (
    <Grid variant="aside_configurator" asChild>
      <aside ref={asideRef} className="pointer-events-auto">
        <Flex className="flex-col items-start shrink-0">
          <AsideName min_buy={data.min_buy} id={data.id} />
          <AsidePrice price={data.price} bounus_count={data.bounus_count} bonus_discount={data.bonus_discount} />
        </Flex>
        {hasPanel && (
          <Flex variant="aside_configurator_content">
            <ScrollArea>
              {STEP_PANELS.map(({ step, Component }) => (
                <div key={step} hidden={currentStepValue !== step}>
                  <Component />
                </div>
              ))}
            </ScrollArea>
          </Flex>
        )}
      </aside>
    </Grid>
  );
};

export { AsideConfigurator };
