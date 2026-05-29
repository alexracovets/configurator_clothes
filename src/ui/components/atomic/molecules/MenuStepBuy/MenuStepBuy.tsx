'use client';

import { Fragment } from 'react';

import { Flex, Text } from '@atoms';
import { useStepsStore } from '@store';
import { useSlidingIndicator } from '@hooks';
import { CONFIGURATOR_STEPS } from '@constants';

import { MenuStepSeparator } from './MenuStepSeparator';

const MenuStepBuy = () => {
  const { currentStep, setStep } = useStepsStore();
  const { wrapperRef, getItemRef, indicator } = useSlidingIndicator(currentStep);

  return (
    <div ref={wrapperRef} className="relative w-fit pt-2">
      <Flex className="gap-3" asChild>
        <ul>
          {CONFIGURATOR_STEPS.map((step, index) => (
            <Fragment key={step.value}>
              {index > 0 && <MenuStepSeparator isActive={index <= currentStep} />}
              <li ref={getItemRef(index)} onClick={() => setStep(index)}>
                <Text data-active={index <= currentStep} variant="menu_step_buy" asChild>
                  <span>{step.name}</span>
                </Text>
              </li>
            </Fragment>
          ))}
        </ul>
      </Flex>
      <Text variant="menu_step_buy_line" asChild style={{ left: indicator.left, width: indicator.width }}>
        <span />
      </Text>
    </div>
  );
};

export { MenuStepBuy };
