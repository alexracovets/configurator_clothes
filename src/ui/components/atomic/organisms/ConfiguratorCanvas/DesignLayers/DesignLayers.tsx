'use client';

import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';

import { registerDesignRenderInvalidate, useNameBridge, useNumberBridge } from '@hooks';

const InvalidateRegistrar = () => {
  const { invalidate } = useThree();
  useEffect(() => registerDesignRenderInvalidate(invalidate), [invalidate]);
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  return null;
};

const DesignLayers = () => {
  useNameBridge();
  useNumberBridge();
  return <InvalidateRegistrar />;
};

export { DesignLayers };
