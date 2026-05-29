import { create } from 'zustand';

const TOTAL_STEPS = 6;

interface StepsStore {
  currentStep: number;
  setStep: (index: number) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const useStepsStore = create<StepsStore>((set) => ({
  currentStep: 0,

  setStep: (index) => set({ currentStep: index }),

  prevStep: () => set(({ currentStep }) => ({ currentStep: Math.max(0, currentStep - 1) })),

  nextStep: () => set(({ currentStep }) => ({ currentStep: Math.min(TOTAL_STEPS - 1, currentStep + 1) })),
}));

export { useStepsStore };
