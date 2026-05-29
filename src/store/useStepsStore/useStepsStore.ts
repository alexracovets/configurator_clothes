import { create } from 'zustand';

import { CONFIGURATOR_STEPS, type StepValue } from '@constants';

interface StepsStore {
  currentStep: number;
  currentStepValue: StepValue;
  setStep: (index: number) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const TOTAL_STEPS = CONFIGURATOR_STEPS.length;

const useStepsStore = create<StepsStore>((set) => ({
  currentStep: 0,
  currentStepValue: CONFIGURATOR_STEPS[0].value,

  setStep: (index) =>
    set({
      currentStep: index,
      currentStepValue: CONFIGURATOR_STEPS[index].value,
    }),

  prevStep: () =>
    set(({ currentStep }) => {
      const next = Math.max(0, currentStep - 1);
      return { currentStep: next, currentStepValue: CONFIGURATOR_STEPS[next].value };
    }),

  nextStep: () =>
    set(({ currentStep }) => {
      const next = Math.min(TOTAL_STEPS - 1, currentStep + 1);
      return { currentStep: next, currentStepValue: CONFIGURATOR_STEPS[next].value };
    }),
}));

export { useStepsStore };
