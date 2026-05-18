import { create } from "zustand";

const TOTAL_STEPS = 6;

interface StepsStore {
  currentStep: number;
  setStep: (index: number) => void;
  prevStep: () => void;
  nextStep: () => void;
}

export const useStepsStore = create<StepsStore>((set) => ({
  currentStep: 0,

  setStep: (index) => set({ currentStep: index }),

  prevStep: () =>
    set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(TOTAL_STEPS - 1, state.currentStep + 1),
    })),
}));
