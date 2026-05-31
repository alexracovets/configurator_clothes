/** Decode logo off the critical path so the first canvas draw is cheaper. */
const preloadLogoDisplayUrl = async (src: string): Promise<void> => {
  if (typeof window === 'undefined' || !('createImageBitmap' in window)) return;
  try {
    const blob = await fetch(src).then((r) => r.blob());
    const bitmap = await createImageBitmap(blob);
    bitmap.close();
  } catch {
    /* browser will decode on first draw */
  }
};

const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

export { preloadLogoDisplayUrl, yieldToMain };
