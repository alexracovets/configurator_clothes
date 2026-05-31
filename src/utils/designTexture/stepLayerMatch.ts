import type { StepValue } from '@constants';
import type { DesignLayer } from '@types';

const STEP_LAYER_TYPE: Partial<Record<StepValue, DesignLayer['type']>> = {
  name: 'text',
  number: 'number',
  logo: 'logo',
};

const getEditableLayerTypeForStep = (step: StepValue): DesignLayer['type'] | null => STEP_LAYER_TYPE[step] ?? null;

const isLayerEditableOnStep = (layer: Pick<DesignLayer, 'type'>, step: StepValue): boolean => {
  const expected = getEditableLayerTypeForStep(step);
  if (!expected) return false;
  return layer.type === expected;
};

export { getEditableLayerTypeForStep, isLayerEditableOnStep };
