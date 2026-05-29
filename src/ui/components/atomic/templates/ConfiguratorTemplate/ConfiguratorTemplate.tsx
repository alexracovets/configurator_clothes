'use client';

import type { ChildrenType } from '@types';

const ConfiguratorTemplate = ({ children }: ChildrenType) => {
  return <main className="h-full min-h-0 bg-linear-to-t from-[#E8E8E8] to-white">{children}</main>;
};

export { ConfiguratorTemplate };
