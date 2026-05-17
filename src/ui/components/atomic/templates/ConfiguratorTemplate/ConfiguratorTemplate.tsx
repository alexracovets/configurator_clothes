"use client";

import type { ChildrenType } from "@types";

export const ConfiguratorTemplate = ({ children }: ChildrenType) => {
  return <main className="h-full min-h-0">{children}</main>;
};
