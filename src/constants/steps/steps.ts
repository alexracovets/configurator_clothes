export const CONFIGURATOR_STEPS = [
  { name: 'colore', value: 'color' },
  { name: 'design', value: 'design' },
  { name: 'sfumatura', value: 'shading' },
  { name: 'nome', value: 'name' },
  { name: 'numero', value: 'number' },
  { name: 'logo', value: 'logo' },
] as const;

export type StepValue = (typeof CONFIGURATOR_STEPS)[number]['value'];
