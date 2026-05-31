const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });

const nativeFileToDisplayUrl = async (file: File): Promise<string> => {
  const url = URL.createObjectURL(file);
  try {
    await loadImage(url);
    return url;
  } catch {
    URL.revokeObjectURL(url);
    throw new Error('Native image load failed');
  }
};

export { nativeFileToDisplayUrl };
